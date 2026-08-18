import { Schema, model, Document } from "mongoose";

export interface IPermission {
  resource: string; // e.g., "leads", "employees", "documents"
  actions: string[]; // e.g., ["create", "read", "update", "delete"]
}

export interface IRole extends Document {
  name: string;
  displayName: string;
  description?: string;
  permissions: IPermission[];
  isSystemRole: boolean; // To distinguish between system roles and custom roles
  isActive: boolean;
  createdBy: Schema.Types.ObjectId;
  updatedBy: Schema.Types.ObjectId;
}

const permissionSchema = new Schema<IPermission>({
  resource: { type: String, required: true },
  actions: [{ type: String, required: true }]
}, { _id: false });

const roleSchema = new Schema<IRole>(
  {
    name: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true
    },
    displayName: { 
      type: String, 
      required: true,
      trim: true
    },
    description: { 
      type: String,
      trim: true
    },
    permissions: [permissionSchema],
    isSystemRole: { 
      type: Boolean, 
      default: false 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    createdBy: { 
      type: Schema.Types.ObjectId, 
      ref: "User"
    },
    updatedBy: { 
      type: Schema.Types.ObjectId, 
      ref: "User"
    }
  },
  { timestamps: true }
);

// Prevent deletion of system roles
roleSchema.pre('findOneAndDelete', function() {
  this.where({ isSystemRole: { $ne: true } });
});

roleSchema.pre('deleteOne', function() {
  this.where({ isSystemRole: { $ne: true } });
});

export const Role = model<IRole>("Role", roleSchema);