import { CustomerLayout } from "@/components/customer/CustomerLayout";
import { Bell } from "lucide-react";

const CustomerNotifications = () => {
  return (
    <CustomerLayout title="Notifications" subtitle="Stay updated with your account activity.">
      <div className="text-center py-20">
        <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg mb-2">Notifications</p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Notification support is not yet available from the backend. 
          You will be notified via email and SMS for important updates regarding 
          your subscriptions, consultations, and payments.
        </p>
      </div>
    </CustomerLayout>
  );
};

export default CustomerNotifications;