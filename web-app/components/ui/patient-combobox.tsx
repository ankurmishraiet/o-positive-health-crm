"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import axios from "@/axios/axios";

interface Patient {
  _id: string;
  patientName: string;
  patientId?: string;
  contact?: {
    mobile?: string;
  };
}

interface PatientComboboxProps {
  value: string;
  onSelect: (patientId: string, patientName: string, patientPhone?: string) => void;
  placeholder?: string;
  className?: string;
}

export function PatientCombobox({
  value,
  onSelect,
  placeholder = "Select patient...",
  className,
}: PatientComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);

  React.useEffect(() => {
    if (searchTerm.length >= 2) {
      searchPatients(searchTerm);
    } else {
      setPatients([]);
    }
  }, [searchTerm]);

  const searchPatients = async (query: string) => {
    try {
      setLoading(true);
      const response = await axios.get("/patients/search", {
        params: { q: query, limit: 20 },
      });
      setPatients(response.data || []);
    } catch (error) {
      console.error("Error searching patients:", error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    onSelect(patient._id, patient.patientName, patient.contact?.mobile);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedPatient ? (
            <span>
              {selectedPatient.patientName}
              {selectedPatient.contact?.mobile && (
                <span className="text-gray-500 ml-2">
                  ({selectedPatient.contact.mobile})
                </span>
              )}
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by name or phone..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {loading && (
              <div className="py-6 text-center text-sm">Searching...</div>
            )}
            {!loading && searchTerm.length < 2 && (
              <div className="py-6 text-center text-sm">
                Type at least 2 characters to search
              </div>
            )}
            {!loading && searchTerm.length >= 2 && patients.length === 0 && (
              <CommandEmpty>No patients found.</CommandEmpty>
            )}
            {!loading && patients.length > 0 && (
              <CommandGroup>
                {patients.map((patient) => (
                  <CommandItem
                    key={patient._id}
                    value={patient._id}
                    onSelect={() => handleSelect(patient)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedPatient?._id === patient._id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{patient.patientName}</span>
                      {patient.contact?.mobile && (
                        <span className="text-xs text-gray-500">
                          {patient.contact.mobile}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
