import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingForm } from '@/components/BookingForm';
import { BookingStatus } from '@/components/BookingStatus';
import { CoachLayout } from '@/components/CoachLayout';
import { BookingHistory } from '@/components/BookingHistory';
import { SeatPreferences } from '@/components/SeatPreferences';
import { useBookingStore } from '@/store/bookingStore';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Armchair, LogOut, LogIn } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { appStatus } = useBookingStore();
  const { user, signOut, loading } = useAuth();

  const handleAuthAction = () => {
    if (user) {
      signOut();
    } else {
      navigate('/auth');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <Armchair className="h-12 w-12 text-primary animate-pulse mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

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
          
          {/* Auth Button */}
          <div className="flex justify-center mt-4">
            <Button
              onClick={handleAuthAction}
              variant="outline"
              className="gap-2"
            >
              {user ? (
                <>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left Column - Booking Interface */}
          <div className="lg:col-span-2 space-y-6">
            <BookingForm />
            {(appStatus === 'pending' || appStatus === 'confirmed' || appStatus === 'failed') && (
              <BookingStatus />
            )}
            {user && <BookingHistory />}
          </div>

          {/* Right Column - Layout & Preferences */}
          <div className="space-y-6 lg:sticky lg:top-8">
            {user && <SeatPreferences />}
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
