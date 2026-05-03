import { Redirect } from 'expo-router';

export default function RootIndex() {
  // In a real app, you would check for the token here
  // For now, we always redirect to the login screen as requested
  return <Redirect href="/login" />;
}
