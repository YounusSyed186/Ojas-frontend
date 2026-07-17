import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CartDrawer } from "@/components/CartDrawer";
import { USER_ROLES } from "@/lib/roles";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Meals from "./pages/Meals.tsx";
import MealDetail from "./pages/MealDetail.tsx";
import Category from "./pages/Category.tsx";
import Plans from "./pages/Plans.tsx";
import PlanDetail from "./pages/PlanDetail.tsx";
import Experts from "./pages/Experts.tsx";
import ExpertDetail from "./pages/ExpertDetail.tsx";
import Builder from "./pages/Builder.tsx";
import BuilderResult from "./pages/BuilderResult.tsx";
import DeliveryPage from "./pages/DeliveryPage.tsx";
import Contact from "./pages/Contact.tsx";
import About from "./pages/About.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import CustomerOverview from "./pages/customer/CustomerOverview.tsx";
import CustomerProfile from "./pages/customer/CustomerProfile.tsx";
import CustomerSubscription from "./pages/customer/CustomerSubscription.tsx";
import CustomerMealPlan from "./pages/customer/CustomerMealPlan.tsx";
import CustomerConsultations from "./pages/customer/CustomerConsultations.tsx";
import CustomerConsultationDetail from "./pages/customer/CustomerConsultationDetail.tsx";
import CustomerPayments from "./pages/customer/CustomerPayments.tsx";
import CustomerNotifications from "./pages/customer/CustomerNotifications.tsx";
import CustomerSettings from "./pages/customer/CustomerSettings.tsx";
import DashboardRedirect from "./pages/DashboardRedirect.tsx";
import DoctorDashboard from "./pages/doctor/DoctorDashboard.tsx";
import DoctorConsultations from "./pages/doctor/DoctorConsultations.tsx";
import DoctorPatients from "./pages/doctor/DoctorPatients.tsx";
import DoctorPatientDetail from "./pages/doctor/DoctorPatientDetail.tsx";
import DoctorMealPlans from "./pages/doctor/DoctorMealPlans.tsx";
import DoctorSchedule from "./pages/doctor/DoctorSchedule.tsx";
import DoctorNotes from "./pages/doctor/DoctorNotes.tsx";
import DoctorProfile from "./pages/doctor/DoctorProfile.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminUsers from "./pages/admin/AdminUsers.tsx";
import AdminDoctors from "./pages/admin/AdminDoctors.tsx";
import AdminCustomers from "./pages/admin/AdminCustomers.tsx";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions.tsx";
import AdminConsultations from "./pages/admin/AdminConsultations.tsx";
import AdminPayments from "./pages/admin/AdminPayments.tsx";
import AdminPlans from "./pages/admin/AdminPlans.tsx";
import AdminMealTemplates from "./pages/admin/AdminMealTemplates.tsx";
import AdminMealOptions from "./pages/admin/AdminMealOptions.tsx";
import AdminPincodes from "./pages/admin/AdminPincodes.tsx";
import AdminSettings from "./pages/admin/AdminSettings.tsx";
import AdminReports from "./pages/admin/AdminReports.tsx";
import Subscribe from "./pages/Subscribe.tsx";
import Checkout from "./pages/Checkout.tsx";
import CustomerOrders from "./pages/customer/CustomerOrders.tsx";
import CustomerOrderDetail from "./pages/customer/CustomerOrderDetail.tsx";
import AdminOrders from "./pages/admin/AdminOrders.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
        <AuthProvider>
        <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/meals" element={<Meals />} />
          <Route path="/meals/:slug" element={<MealDetail />} />
          <Route path="/categories/:slug" element={<Category />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/plans/:id" element={<PlanDetail />} />
          <Route path="/experts" element={<Experts />} />
          <Route path="/experts/:slug" element={<ExpertDetail />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/builder/result" element={<BuilderResult />} />
          <Route path="/delivery" element={<DeliveryPage />} />
          <Route path="/checkout" element={<ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}><Checkout /></ProtectedRoute>} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
          <Route path="/customer/dashboard" element={<ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}><Dashboard /></ProtectedRoute>} />
          <Route path="/customer/overview" element={<ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}><CustomerOverview /></ProtectedRoute>} />
          <Route path="/customer/profile" element={<ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}><CustomerProfile /></ProtectedRoute>} />
          <Route path="/customer/subscription" element={<ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}><CustomerSubscription /></ProtectedRoute>} />
          <Route path="/customer/meal-plan" element={<ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}><CustomerMealPlan /></ProtectedRoute>} />
          <Route path="/customer/consultations" element={<ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}><CustomerConsultations /></ProtectedRoute>} />
          <Route path="/customer/consultations/:id" element={<ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}><CustomerConsultationDetail /></ProtectedRoute>} />
          <Route path="/customer/payments" element={<ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}><CustomerPayments /></ProtectedRoute>} />
          <Route path="/customer/orders" element={<ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}><CustomerOrders /></ProtectedRoute>} />
          <Route path="/customer/orders/:orderNumber" element={<ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}><CustomerOrderDetail /></ProtectedRoute>} />
          <Route path="/customer/notifications" element={<ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}><CustomerNotifications /></ProtectedRoute>} />
          <Route path="/customer/settings" element={<ProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}><CustomerSettings /></ProtectedRoute>} />
          <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR]}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/consultations" element={<ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR]}><DoctorConsultations /></ProtectedRoute>} />
          <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR]}><DoctorPatients /></ProtectedRoute>} />
          <Route path="/doctor/patients/:id" element={<ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR]}><DoctorPatientDetail /></ProtectedRoute>} />
          <Route path="/doctor/meal-plans" element={<ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR]}><DoctorMealPlans /></ProtectedRoute>} />
          <Route path="/doctor/schedule" element={<ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR]}><DoctorSchedule /></ProtectedRoute>} />
          <Route path="/doctor/notes" element={<ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR]}><DoctorNotes /></ProtectedRoute>} />
          <Route path="/doctor/profile" element={<ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR]}><DoctorProfile /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/doctors" element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}><AdminDoctors /></ProtectedRoute>} />
          <Route path="/admin/customers" element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}><AdminCustomers /></ProtectedRoute>} />
          <Route path="/admin/subscriptions" element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}><AdminSubscriptions /></ProtectedRoute>} />
          <Route path="/admin/consultations" element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}><AdminConsultations /></ProtectedRoute>} />
          <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}><AdminPayments /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}><AdminOrders /></ProtectedRoute>} />
          <Route path="/admin/plans" element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}><AdminPlans /></ProtectedRoute>} />
          <Route path="/admin/meal-templates" element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}><AdminMealTemplates /></ProtectedRoute>} />
          <Route path="/admin/meal-options" element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}><AdminMealOptions /></ProtectedRoute>} />
          <Route path="/admin/pincodes" element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}><AdminPincodes /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}><AdminSettings /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}><AdminReports /></ProtectedRoute>} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="*" element={<NotFound />} />
          </Routes>
          <CartDrawer />
        </BrowserRouter>
        </CartProvider>
        </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
