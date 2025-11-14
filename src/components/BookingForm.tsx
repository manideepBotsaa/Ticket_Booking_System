import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBookingStore } from '@/store/bookingStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, Ticket } from 'lucide-react';

interface BookingResponse {
  requestId: string;
  status: 'pending';
}

const requestBooking = async (numSeats: number): Promise<BookingResponse> => {
  const response = await fetch('http://localhost:3000/request-booking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ numSeats }),
  });

  if (!response.ok) {
    throw new Error('Failed to submit booking request');
  }

  return response.json();
};

export const BookingForm = () => {
  const [numSeats, setNumSeats] = useState(1);
  const { appStatus, setRequestId, setAppStatus } = useBookingStore();

  const mutation = useMutation({
    mutationFn: requestBooking,
    onMutate: () => {
      setAppStatus('booking');
    },
    onSuccess: (data) => {
      setRequestId(data.requestId);
      setAppStatus('pending');
      toast({
        title: 'Booking Request Submitted',
        description: `Request ID: ${data.requestId}`,
      });
    },
    onError: (error: Error) => {
      setAppStatus('failed');
      toast({
        title: 'Booking Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numSeats > 0 && numSeats <= 7) {
      mutation.mutate(numSeats);
    } else {
      toast({
        title: 'Invalid Input',
        description: 'Please enter between 1 and 7 seats',
        variant: 'destructive',
      });
    }
  };

  const isDisabled = appStatus === 'booking' || appStatus === 'pending';

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-primary" />
          Book Your Seats
        </CardTitle>
        <CardDescription>
          Request seats using our priority + aging queue system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="numSeats">Number of Seats (1-7)</Label>
            <Input
              id="numSeats"
              type="number"
              min={1}
              max={7}
              value={numSeats}
              onChange={(e) => setNumSeats(parseInt(e.target.value) || 1)}
              disabled={isDisabled}
              className="text-lg"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isDisabled}
            size="lg"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Book Tickets'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
