"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { MessageSquare, Send, LayoutTemplateIcon as Template, Plus } from "lucide-react"

interface MessageTemplate {
  _id: string
  templateId: string
  name: string
  content: string
  variables: string[]
  category: string
}

interface Lead {
  _id: string
  patientName: string
  mobile: string
  whatsappNumber?: string
  leadStatus: string
}

export default function WhatsAppPage() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [customMessage, setCustomMessage] = useState("")
  const [messageType, setMessageType] = useState<"template" | "custom">("template")
  const [loading, setLoading] = useState(false)
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    content: "",
    category: "",
  })
  const [showCreateTemplate, setShowCreateTemplate] = useState(false)

  useEffect(() => {
    fetchTemplates()
    fetchLeads()
  }, [])

  const fetchTemplates = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/api/v1/communication/templates?type=WhatsApp`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      } else {
        // Endpoint might not exist yet, use empty array
        setTemplates([]);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      setTemplates([]);
    }
  }

  const fetchLeads = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/api/v1/leads`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      } else {
        setLeads([]);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
      setLeads([]);
    }
  }

  const handleSendMessage = async () => {
    if (selectedLeads.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one recipient",
        variant: "destructive",
      })
      return
    }

    if (messageType === "template" && !selectedTemplate) {
      toast({
        title: "Error",
        description: "Please select a template",
        variant: "destructive",
      })
      return
    }

    if (messageType === "custom" && !customMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/api/v1/communication/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          type: "WhatsApp",
          recipients: selectedLeads,
          templateId: messageType === "template" ? selectedTemplate : null,
          customMessage: messageType === "custom" ? customMessage : null,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `WhatsApp messages sent to ${selectedLeads.length} recipients`,
        });
        setSelectedLeads([]);
        setCustomMessage("");
        setSelectedTemplate("");
      } else {
        throw new Error("Failed to send messages");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send messages",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/api/v1/communication/templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          ...newTemplate,
          type: "WhatsApp",
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Template created successfully",
        });
        setNewTemplate({ name: "", content: "", category: "" });
        setShowCreateTemplate(false);
        fetchTemplates();
      } else {
        throw new Error("Failed to create template");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      })
    }
  }

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads((prev) => (prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]))
  }

  const selectAllLeads = () => {
    setSelectedLeads(leads.map((lead) => lead._id))
  }

  const clearSelection = () => {
    setSelectedLeads([])
  }

  const selectedTemplate_obj = templates.find((t) => t._id === selectedTemplate)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <MessageSquare className="mr-3 h-8 w-8 text-green-600" />
            WhatsApp Communication
          </h1>
          <p className="text-gray-600">Send WhatsApp messages to patients and leads</p>
        </div>
        <Button onClick={() => setShowCreateTemplate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Composition */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compose Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <Button
                  variant={messageType === "template" ? "default" : "outline"}
                  onClick={() => setMessageType("template")}
                >
                  <Template className="mr-2 h-4 w-4" />
                  Use Template
                </Button>
                <Button
                  variant={messageType === "custom" ? "default" : "outline"}
                  onClick={() => setMessageType("custom")}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Custom Message
                </Button>
              </div>

              {messageType === "template" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Template</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a message template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template._id} value={template._id}>
                            {template.name} - {template.category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedTemplate_obj && (
                    <div className="space-y-2">
                      <Label>Template Preview</Label>
                      <div className="p-4 bg-gray-50 rounded-lg border">
                        <p className="whitespace-pre-wrap">{selectedTemplate_obj.content}</p>
                        {selectedTemplate_obj.variables.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">Variables:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedTemplate_obj.variables.map((variable) => (
                                <Badge key={variable} variant="secondary">
                                  {variable}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="customMessage">Custom Message</Label>
                  <Textarea
                    id="customMessage"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Type your custom message here..."
                    rows={6}
                  />
                </div>
              )}

              <Button onClick={handleSendMessage} disabled={loading} className="w-full">
                <Send className="mr-2 h-4 w-4" />
                {loading ? "Sending..." : `Send to ${selectedLeads.length} Recipients`}
              </Button>
            </CardContent>
          </Card>

          {/* Create Template Modal */}
          {showCreateTemplate && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    placeholder="Enter template name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="templateCategory">Category</Label>
                  <Select
                    value={newTemplate.category}
                    onValueChange={(value) => setNewTemplate({ ...newTemplate, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="appointment">Appointment</SelectItem>
                      <SelectItem value="followup">Follow-up</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="welcome">Welcome</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="templateContent">Message Content</Label>
                  <Textarea
                    id="templateContent"
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                    placeholder="Enter message content..."
                    rows={4}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleCreateTemplate}>Create Template</Button>
                  <Button variant="outline" onClick={() => setShowCreateTemplate(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recipients Selection */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recipients ({selectedLeads.length})</span>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={selectAllLeads}>
                    Select All
                  </Button>
                  <Button size="sm" variant="outline" onClick={clearSelection}>
                    Clear
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {leads.map((lead) => (
                  <div key={lead._id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                    <Checkbox
                      checked={selectedLeads.includes(lead._id)}
                      onCheckedChange={() => toggleLeadSelection(lead._id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{lead.patientName}</p>
                      <p className="text-xs text-gray-500">{lead.whatsappNumber || lead.mobile}</p>
                      <Badge variant="secondary" className="text-xs">
                        {lead.leadStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
