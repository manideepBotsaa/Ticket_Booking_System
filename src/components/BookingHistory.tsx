import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Calendar, MapPin } from 'lucide-react';

interface BookingRecord {
  id: string;
  request_id: string;
  num_seats: number;
  seat_preference: string | null;
  status: string;
  allocated_seats: string[] | null;
  error_message: string | null;
  created_at: string;
}

const fetchBookingHistory = async (): Promise<BookingRecord[]> => {
  const { data, error } = await supabase
    .from('booking_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data || [];
};

export const BookingHistory = () => {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookingHistory'],
    queryFn: fetchBookingHistory,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Booking History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Booking History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No bookings yet. Make your first reservation above!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Booking History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="border rounded-lg p-4 space-y-2 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">
                  {booking.num_seats} {booking.num_seats === 1 ? 'Seat' : 'Seats'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(booking.created_at), 'PPp')}
                </p>
              </div>
              <Badge
                variant={
                  booking.status === 'confirmed'
                    ? 'default'
                    : booking.status === 'failed'
                    ? 'destructive'
                    : 'secondary'
                }
                className={
                  booking.status === 'confirmed'
                    ? 'bg-success hover:bg-success/90'
                    : ''
                }
              >
                {booking.status}
              </Badge>
            </div>
            
            {booking.seat_preference && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="capitalize">{booking.seat_preference} preference</span>
              </div>
            )}
            
            {booking.allocated_seats && booking.allocated_seats.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {booking.allocated_seats.map((seat) => (
                  <Badge key={seat} variant="outline" className="text-xs">
                    {seat}
                  </Badge>
                ))}
              </div>
            )}
            
            {booking.error_message && (
              <p className="text-sm text-destructive">{booking.error_message}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};