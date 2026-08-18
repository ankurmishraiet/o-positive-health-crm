# Quick Start Guide - Pagination Implementation

## For Developers

This guide helps you quickly understand and work with the new pagination system.

## What Changed?

### Backend (`server/`)
- ✅ Lead service now supports pagination with `page`, `limit`, `sortBy`, `sortOrder`
- ✅ Database indexes added for fast queries
- ✅ Response includes pagination metadata

### Frontend (`web-app/`)
- ✅ Infinite scrolling replaces loading all leads at once
- ✅ Loading states for better UX
- ✅ Automatic load more when scrolling

## Quick Integration Examples

### Using the Pagination API

```typescript
// Basic pagination
const response = await axios.get('/leads?page=1&limit=50');

// Response structure
{
  leads: Lead[],
  pagination: {
    total: number,      // Total count of all leads
    page: number,       // Current page number
    limit: number,      // Leads per page
    totalPages: number, // Total number of pages
    hasMore: boolean    // Whether more pages exist
  }
}
```

### Filtering Examples

```typescript
// Filter by status
GET /leads?page=1&limit=50&leadStatus=New

// Filter by creator
GET /leads?page=1&limit=50&createdBy=USER_ID

// Search
GET /leads?page=1&limit=50&search=john

// Combine filters
GET /leads?page=1&limit=50&leadStatus=Hot%20Lead&createdBy=USER_ID&search=cardiac
```

### Implementing Infinite Scroll in Other Pages

Copy this pattern to add infinite scroll to other pages:

```typescript
const [data, setData] = useState<Item[]>([]);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
const [isLoadingMore, setIsLoadingMore] = useState(false);
const loadMoreRef = useRef<HTMLDivElement>(null);

// Fetch function
const fetchData = useCallback(async (pageNum: number, append = false) => {
  if (!append) setLoading(true);
  else setIsLoadingMore(true);
  
  try {
    const response = await axios.get(`/api/items?page=${pageNum}&limit=50`);
    const { items, pagination } = response.data;
    
    if (append) {
      setData(prev => [...prev, ...items]);
    } else {
      setData(items);
    }
    
    setHasMore(pagination.hasMore);
    setPage(pageNum);
  } catch (error) {
    console.error(error);
  } finally {
    if (!append) setLoading(false);
    else setIsLoadingMore(false);
  }
}, []);

// Initial load
useEffect(() => {
  fetchData(1, false);
}, []);

// Infinite scroll observer
useEffect(() => {
  if (!loadMoreRef.current || !hasMore || isLoadingMore) return;
  
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
        fetchData(page + 1, true);
      }
    },
    { threshold: 0.1 }
  );
  
  const currentRef = loadMoreRef.current;
  observer.observe(currentRef);
  
  return () => {
    if (currentRef) observer.unobserve(currentRef);
  };
}, [hasMore, isLoadingMore, page]);

// In your render
<div>
  {data.map(item => <ItemCard key={item._id} item={item} />)}
  
  {hasMore && (
    <div ref={loadMoreRef}>
      {isLoadingMore && <Loader />}
    </div>
  )}
</div>
```

## Adding Pagination to Other Models

### 1. Update Service

```typescript
async list(filters: any = {}) {
  const {
    page = 1,
    limit = 50,
    sortBy = "createdAt",
    sortOrder = "desc",
    ...queryFilters
  } = filters;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const query: any = {};
  // Add your filters here
  
  const sort: any = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  const [items, total] = await Promise.all([
    Model.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Model.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      hasMore: pageNum * limitNum < total,
    },
  };
}
```

### 2. Add Indexes

```typescript
// In your model file
ModelSchema.index({ createdAt: -1 });
ModelSchema.index({ status: 1, createdAt: -1 });
// Add other indexes as needed
```

### 3. Update Controller

```typescript
async list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await Service.list(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
```

## Database Indexes

### Creating Indexes

After adding pagination, always create indexes:

```bash
cd server
npm run indexes:create
```

### Monitoring Index Usage

```javascript
// In MongoDB shell
db.leads.explain("executionStats").find({ leadStatus: "New" }).sort({ createdAt: -1 }).limit(50)

// Check if IXSCAN is used (good) instead of COLLSCAN (bad)
```

## Performance Tips

### DO ✅
- Use indexes on frequently queried fields
- Keep page size reasonable (50-100 items)
- Use lean() queries when you don't need Mongoose documents
- Implement proper loading states
- Add cleanup in useEffect

### DON'T ❌
- Fetch all items at once if there are thousands
- Skip index creation in production
- Make pagination queries without indexes
- Forget to handle errors in infinite scroll
- Use very large page sizes (>1000)

## Common Issues & Solutions

### Issue: Queries are slow
```bash
# Solution: Create indexes
npm run indexes:create

# Verify indexes exist
db.leads.getIndexes()
```

### Issue: Infinite scroll not working
```typescript
// Check these conditions:
1. hasMore is true
2. isLoadingMore is false
3. IntersectionObserver is properly set up
4. loadMoreRef is attached to an element
```

### Issue: Duplicate items loading
```typescript
// Ensure page state is updated correctly
setPage(pageNum);  // Update page state

// Don't call fetchData in render or without proper dependencies
```

## Testing Your Pagination

1. **Manual Testing**:
   ```bash
   # Test API directly
   curl "http://localhost:4000/api/v1/leads?page=1&limit=50"
   ```

2. **Performance Testing**:
   ```typescript
   // Add console.time in your fetch function
   console.time('fetchData');
   const response = await axios.get(url);
   console.timeEnd('fetchData');
   ```

3. **Load Testing**:
   ```bash
   # Use Apache Bench
   ab -n 1000 -c 10 http://localhost:4000/api/v1/leads?page=1&limit=50
   ```

## Migration Checklist

When deploying pagination to production:

- [ ] Run database index creation script
- [ ] Test with production data size
- [ ] Monitor API response times
- [ ] Check memory usage in production
- [ ] Verify no performance degradation
- [ ] Update API documentation
- [ ] Train support team on new behavior

## Resources

- **Full Documentation**: See `PAGINATION_IMPLEMENTATION.md`
- **Testing Guide**: See `TESTING_PAGINATION.md`
- **Model File**: `server/src/models/lead.model.ts`
- **Service File**: `server/src/services/lead.service.ts`
- **Frontend Page**: `web-app/app/dashboard/leads/page.tsx`

## Support

If you encounter issues:
1. Check the console for errors
2. Verify indexes are created
3. Review the full documentation
4. Check Network tab for API responses
5. Test with smaller dataset first

## Next Steps

1. Review the implementation in `web-app/app/dashboard/leads/page.tsx`
2. Test locally with your dataset
3. Run the index creation script
4. Follow the testing guide
5. Monitor performance in production
