import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { Loader2, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

type PreferenceType = 'window' | 'aisle' | 'middle' | 'any';

interface SeatPreference {
  id: string;
  user_id: string;
  preference_type: PreferenceType;
  created_at: string;
  updated_at: string;
}

const fetchPreferences = async (): Promise<SeatPreference | null> => {
  const { data, error } = await supabase
    .from('seat_preferences')
    .select('*')
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;
  return data as SeatPreference | null;
};

const upsertPreference = async (preference: PreferenceType) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('seat_preferences')
    .upsert({
      user_id: user.id,
      preference_type: preference,
    });

  if (error) throw error;
};

export const SeatPreferences = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPreference, setSelectedPreference] = useState<PreferenceType>('any');

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['seatPreferences'],
    queryFn: fetchPreferences,
    enabled: !!user,
  });

  useEffect(() => {
    if (preferences) {
      setSelectedPreference(preferences.preference_type);
    }
  }, [preferences]);

  const mutation = useMutation({
    mutationFn: upsertPreference,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seatPreferences'] });
      toast({
        title: 'Preferences Saved',
        description: 'Your seat preferences have been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    mutation.mutate(selectedPreference);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seat Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Seat Preferences
        </CardTitle>
        <CardDescription>
          Set your default seat type preference for future bookings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={selectedPreference} onValueChange={(value) => setSelectedPreference(value as PreferenceType)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="window" id="window" />
            <Label htmlFor="window" className="cursor-pointer">
              Window Seat - Great views and wall to lean on
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="aisle" id="aisle" />
            <Label htmlFor="aisle" className="cursor-pointer">
              Aisle Seat - Easy access and more legroom
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="middle" id="middle" />
            <Label htmlFor="middle" className="cursor-pointer">
              Middle Seat - Between window and aisle
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="any" id="any" />
            <Label htmlFor="any" className="cursor-pointer">
              Any Seat - No preference
            </Label>
          </div>
        </RadioGroup>

        <Button
          onClick={handleSave}
          disabled={mutation.isPending || selectedPreference === preferences?.preference_type}
          className="w-full"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Preferences'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};