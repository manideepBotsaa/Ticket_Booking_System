import { BookingForm } from '@/components/BookingForm';
import { BookingStatus } from '@/components/BookingStatus';
import { CoachLayout } from '@/components/CoachLayout';
import { useBookingStore } from '@/store/bookingStore';
import { Armchair } from 'lucide-react';

const Index = () => {
  const { appStatus } = useBookingStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <header className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Armchair className="h-10 w-10 text-primary" />
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Priority Queue Booking
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience our asynchronous booking system with priority-based seat allocation
          </p>
        </header>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Booking Interface */}
          <div className="space-y-6">
            <BookingForm />
            {(appStatus === 'pending' || appStatus === 'confirmed' || appStatus === 'failed') && (
              <BookingStatus />
            )}
          </div>

          {/* Right Column - Coach Layout */}
          <div className="lg:sticky lg:top-8">
            <CoachLayout />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground pt-8 border-t">
          <p>
            Powered by Priority + Aging Queue Algorithm | Updates every 2-3 seconds
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
