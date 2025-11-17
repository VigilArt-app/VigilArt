export default function ProfilePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <p>Manage your profile information here.</p>
      
      <div className="mt-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Personal Information</h2>
          <p className="text-muted-foreground">Update your personal details and preferences.</p>
        </div>
      </div>
    </div>
  );
}
