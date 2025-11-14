import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBookingStore } from '@/store/bookingStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, Ticket, MapPin } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';

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

type PreferenceType = 'window' | 'aisle' | 'middle' | 'any';

const fetchUserPreference = async (): Promise<PreferenceType> => {
  const { data } = await supabase
    .from('seat_preferences')
    .select('preference_type')
    .maybeSingle();
  
  return (data?.preference_type as PreferenceType) || 'any';
};

const saveBookingToHistory = async (
  requestId: string,
  numSeats: number,
  preference: PreferenceType
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('booking_history').insert({
    user_id: user.id,
    request_id: requestId,
    num_seats: numSeats,
    seat_preference: preference,
    status: 'pending',
  });
};

export const BookingForm = () => {
  const { user } = useAuth();
  const [numSeats, setNumSeats] = useState(1);
  const [seatPreference, setSeatPreference] = useState<PreferenceType>('any');
  const { appStatus, setRequestId, setAppStatus } = useBookingStore();

  // Fetch user's saved preference
  const { data: savedPreference } = useQuery({
    queryKey: ['userPreference'],
    queryFn: fetchUserPreference,
    enabled: !!user,
  });

  useEffect(() => {
    if (savedPreference) {
      setSeatPreference(savedPreference);
    }
  }, [savedPreference]);

  const mutation = useMutation({
    mutationFn: requestBooking,
    onMutate: () => {
      setAppStatus('booking');
    },
    onSuccess: async (data) => {
      setRequestId(data.requestId);
      setAppStatus('pending');
      
      // Save to booking history
      if (user) {
        await saveBookingToHistory(data.requestId, numSeats, seatPreference);
      }
      
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

          {user && (
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Seat Preference (Optional)
              </Label>
              <RadioGroup
                value={seatPreference}
                onValueChange={(value) => setSeatPreference(value as PreferenceType)}
                disabled={isDisabled}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="window" id="pref-window" />
                  <Label htmlFor="pref-window" className="cursor-pointer font-normal">
                    Window
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="aisle" id="pref-aisle" />
                  <Label htmlFor="pref-aisle" className="cursor-pointer font-normal">
                    Aisle
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="middle" id="pref-middle" />
                  <Label htmlFor="pref-middle" className="cursor-pointer font-normal">
                    Middle
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="any" id="pref-any" />
                  <Label htmlFor="pref-any" className="cursor-pointer font-normal">
                    Any
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

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
