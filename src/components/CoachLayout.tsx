import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SeatStatus {
  status: 'available' | 'booked' | 'locked' | 'processing';
}

type CoachLayoutResponse = Record<string, SeatStatus>;

const fetchCoachLayout = async (): Promise<CoachLayoutResponse> => {
  const response = await fetch('http://localhost:3000/coach-layout');
  
  if (!response.ok) {
    throw new Error('Failed to fetch coach layout');
  }

  return response.json();
};

export const CoachLayout = () => {
  const { data: layout, isLoading, error } = useQuery({
    queryKey: ['coachLayout'],
    queryFn: fetchCoachLayout,
    refetchInterval: 3000,
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Coach Layout</CardTitle>
          <CardDescription>Real-time seat availability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 70 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Coach Layout</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load coach layout</p>
        </CardContent>
      </Card>
    );
  }

  const seats = Object.entries(layout || {});
  const statusCounts = seats.reduce(
    (acc, [_, seat]) => {
      acc[seat.status] = (acc[seat.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Coach Layout</CardTitle>
        <CardDescription>Real-time seat availability (80 seats total)</CardDescription>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className="bg-success/20 text-success border-success">
            Available: {statusCounts.available || 0}
          </Badge>
          <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive">
            Booked: {statusCounts.booked || 0}
          </Badge>
          <Badge variant="outline" className="bg-locked/20 text-locked border-locked">
            Locked: {statusCounts.locked || statusCounts.processing || 0}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {seats.map(([seatId, seat]) => (
            <div
              key={seatId}
              className={cn(
                'aspect-square rounded-lg border-2 flex items-center justify-center font-semibold text-xs sm:text-sm transition-all duration-200 hover:scale-105',
                seat.status === 'available' &&
                  'bg-success/20 border-success text-success hover:bg-success/30',
                seat.status === 'booked' &&
                  'bg-destructive/20 border-destructive text-destructive cursor-not-allowed',
                (seat.status === 'locked' || seat.status === 'processing') &&
                  'bg-locked/20 border-locked text-locked animate-pulse'
              )}
              title={`${seatId}: ${seat.status}`}
            >
              {seatId}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
