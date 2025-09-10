'use client';

import { useState } from 'react';
import { Download, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { api } from '@/trpc/client';
import { toast } from 'sonner';

export function UsersCsvDownload() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const downloadCsvMutation = api.admin.downloadUsersCsv.useMutation({
    onSuccess: data => {
      // Create and trigger download
      const blob = new Blob([data.csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(
        `Successfully downloaded CSV with ${data.userCount} users created after ${format(selectedDate!, 'PPP')}`
      );
    },
    onError: error => {
      toast.error(`Failed to download CSV: ${error.message}`);
    },
  });

  const handleDownload = () => {
    if (!selectedDate) {
      toast.error('Please select a date first');
      return;
    }

    downloadCsvMutation.mutate({
      createdAfter: selectedDate,
    });
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-4">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">
            Download users created after:
          </label>
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, 'PPP')
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={date => {
                  setSelectedDate(date);
                  setIsPopoverOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button
          onClick={handleDownload}
          disabled={!selectedDate || downloadCsvMutation.isPending}
          className="flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>
            {downloadCsvMutation.isPending ? 'Downloading...' : 'Download CSV'}
          </span>
        </Button>
      </div>

      {selectedDate && (
        <p className="text-sm text-muted-foreground">
          This will download all users created on or after{' '}
          <span className="font-medium">{format(selectedDate, 'PPP')}</span>
        </p>
      )}
    </div>
  );
}
