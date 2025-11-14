import { useQuery } from '@tanstack/react-query';
import { useBookingStore } from '@/store/bookingStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BookingStatusResponse {
  status: 'pending' | 'confirmed' | 'failed';
  allocatedSeats?: string[];
  error?: string;
}

const fetchBookingStatus = async (requestId: string): Promise<BookingStatusResponse> => {
  const response = await fetch(`http://localhost:3000/booking-status/${requestId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch booking status');
  }

  return response.json();
};

export const BookingStatus = () => {
  const { requestId, appStatus, setAppStatus, reset } = useBookingStore();

  const { data } = useQuery({
    queryKey: ['bookingStatus', requestId],
    queryFn: () => fetchBookingStatus(requestId!),
    enabled: requestId !== null && appStatus === 'pending',
    refetchInterval: (query) => {
      const currentData = query.state.data;
      if (currentData?.status === 'confirmed' || currentData?.status === 'failed') {
        setAppStatus(currentData.status);
        return false; // Stop polling
      }
      return 2000; // Continue polling every 2 seconds
    },
  });

  if (appStatus !== 'pending' && appStatus !== 'confirmed' && appStatus !== 'failed') {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Booking Status</span>
          {requestId && (
            <Badge variant="outline" className="font-mono text-xs">
              {requestId}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {appStatus === 'pending' && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Processing Your Request</AlertTitle>
            <AlertDescription>
              Your booking is being processed using our priority queue system. This may take a moment...
            </AlertDescription>
          </Alert>
        )}

        {appStatus === 'confirmed' && data?.allocatedSeats && (
          <Alert className="border-success bg-success/10">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertTitle className="text-success">Booking Confirmed! 🎉</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="font-semibold mb-2">Your seats have been reserved:</p>
              <div className="flex flex-wrap gap-2">
                {data.allocatedSeats.map((seat) => (
                  <Badge key={seat} variant="default" className="bg-success hover:bg-success/90">
                    {seat}
                  </Badge>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {appStatus === 'failed' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Booking Failed</AlertTitle>
            <AlertDescription>
              {data?.error || 'Unable to allocate seats. Please try again with fewer seats or try later.'}
            </AlertDescription>
          </Alert>
        )}

        {(appStatus === 'confirmed' || appStatus === 'failed') && (
          <Button
            onClick={reset}
            variant="outline"
            className="w-full"
          >
            Book Another Ticket
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
