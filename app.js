const state = {
  user: null,
  bookings: [],
  services: [],
  adminMembershipOrders: [],
  adminResolvedCustomer: null,
  adminCustomerForm: {
    name: '',
    email: '',
    phone: '',
  },
  postLoginChoice: '',
  activeUserTab: 'services',
  membership: {
    plans: [],
    active: false,
    current: null,
  },
  membershipAdditions: {},
  membershipCheckout: null,
  ivSelections: {},
  selectedServiceCategory: null,
  selectedSingleSessionServiceName: '',
  singleSessionEditingBookingId: '',
  selectedHydrogenServiceName: '',
  selectedHydrogenExtraSessions: 0,
  selectedHydrogenSlots: [],
  selectedHydrogenAddOnServiceName: '',
  selectedHydrogenAddOnSessionIndex: 0,
  hydrogenEditingGroupId: '',
  activeHydrogenSessionIndex: 0,
  activeHydrogenSessionDate: '',
  activeHydrogenSessionTime: '',
  selectedServiceDate: '',
  slotAvailability: {},
  slotCapacityByService: {},
  slotAvailabilityLoading: false,
  filters: {
    search: '',
    status: 'all',
    date: '',
  },
};

const SLOT_OPTIONS = [
  { value: '09:30', label: '9:30 AM - 11:00 AM' },
  { value: '10:30', label: '10:30 AM - 12:00 PM' },
  { value: '11:30', label: '11:30 AM - 1:00 PM' },
  { value: '12:30', label: '12:30 PM - 2:00 PM' },
  { value: '13:30', label: '1:30 PM - 3:00 PM' },
  { value: '14:30', label: '2:30 PM - 4:00 PM' },
  { value: '15:30', label: '3:30 PM - 5:00 PM' },
  { value: '16:30', label: '4:30 PM - 6:00 PM' },
  { value: '17:30', label: '5:30 PM - 7:00 PM' },
  { value: '18:30', label: '6:30 PM - 8:00 PM' },
  { value: '19:30', label: '7:30 PM - 9:00 PM' },
];
const BOOKING_WINDOW_DAYS = 60;
const IV_REBOOK_COOLDOWN_DAYS = 14;
const MAX_HYDROGEN_SESSIONS_PER_DAY_PER_USER = 3;

const elements = {
  authCard: document.getElementById('authCard'),
  authTitle: document.getElementById('authTitle'),
  authSwitchText: document.getElementById('authSwitchText'),
  authSwitchBtn: document.getElementById('authSwitchBtn'),
  authForm: document.getElementById('authForm'),
  authNameWrap: document.getElementById('authNameWrap'),
  authName: document.getElementById('authName'),
  authRoleWrap: document.getElementById('authRoleWrap'),
  authRole: document.getElementById('authRole'),
  authEmail: document.getElementById('authEmail'),
  authPassword: document.getElementById('authPassword'),
  authOtpWrap: document.getElementById('authOtpWrap'),
  authOtp: document.getElementById('authOtp'),
  authSubmitBtn: document.getElementById('authSubmitBtn'),
  authError: document.getElementById('authError'),
  forgotPasswordBtn: document.getElementById('forgotPasswordBtn'),

  profileBtn: document.getElementById('profileBtn'),
  profileAvatar: document.getElementById('profileAvatar'),
  userName: document.getElementById('userName'),
  userRole: document.getElementById('userRole'),
  logoutBtn: document.getElementById('logoutBtn'),
  appArea: document.getElementById('appArea'),

  profileDialog: document.getElementById('profileDialog'),
  closeProfileDialogBtn: document.getElementById('closeProfileDialogBtn'),
  cancelProfileBtn: document.getElementById('cancelProfileBtn'),
  profileForm: document.getElementById('profileForm'),
  profileFormMessage: document.getElementById('profileFormMessage'),
  profileName: document.getElementById('profileName'),
  profileAge: document.getElementById('profileAge'),
  profileGender: document.getElementById('profileGender'),
  profileMobile: document.getElementById('profileMobile'),
  profileAvatarFile: document.getElementById('profileAvatarFile'),
  profileAvatarPreview: document.getElementById('profileAvatarPreview'),

  totalCount: document.getElementById('totalCount'),
  confirmedCount: document.getElementById('confirmedCount'),
  pendingCount: document.getElementById('pendingCount'),
  cancelledCount: document.getElementById('cancelledCount'),
  memberChoiceGate: document.getElementById('memberChoiceGate'),
  userTabNav: document.getElementById('userTabNav'),
  userTabServices: document.getElementById('userTabServices'),
  userTabMembership: document.getElementById('userTabMembership'),
  userTabBookings: document.getElementById('userTabBookings'),
  continueAsMemberBtn: document.getElementById('continueAsMemberBtn'),
  continueAsNonMemberBtn: document.getElementById('continueAsNonMemberBtn'),
  membershipSection: document.getElementById('membershipSection'),
  servicesSection: document.getElementById('servicesSection'),
  bookingFiltersSection: document.getElementById('bookingFiltersSection'),
  userBookingsSection: document.getElementById('userBookingsSection'),

  serviceGrid: document.getElementById('serviceGrid'),
  serviceEmpty: document.getElementById('serviceEmpty'),
  servicePanelLead: document.getElementById('servicePanelLead'),
  adminCustomerName: document.getElementById('adminCustomerName'),
  adminCustomerEmail: document.getElementById('adminCustomerEmail'),
  adminCustomerPhone: document.getElementById('adminCustomerPhone'),
  adminClientMeta: document.getElementById('adminClientMeta'),
  adminCustomerMessage: document.getElementById('adminCustomerMessage'),
  membershipPlans: document.getElementById('membershipPlans'),
  membershipStatusText: document.getElementById('membershipStatusText'),
  memberFlowLabel: document.getElementById('memberFlowLabel'),
  membershipBackBtn: document.getElementById('membershipBackBtn'),
  membershipNextBtn: document.getElementById('membershipNextBtn'),
  servicesBackBtn: document.getElementById('servicesBackBtn'),
  servicesNextBtn: document.getElementById('servicesNextBtn'),
  bookingsBackBtn: document.getElementById('bookingsBackBtn'),
  bookingsPayAllBtn: document.getElementById('bookingsPayAllBtn'),
  userCheckoutSummary: document.getElementById('userCheckoutSummary'),
  membershipDialog: document.getElementById('membershipDialog'),
  membershipForm: document.getElementById('membershipForm'),
  membershipDialogTitle: document.getElementById('membershipDialogTitle'),
  membershipPlanSummary: document.getElementById('membershipPlanSummary'),
  membershipMembersGrid: document.getElementById('membershipMembersGrid'),
  closeMembershipDialogBtn: document.getElementById('closeMembershipDialogBtn'),
  cancelMembershipBtn: document.getElementById('cancelMembershipBtn'),

  searchInput: document.getElementById('searchInput'),
  statusFilter: document.getElementById('statusFilter'),
  dateFilter: document.getElementById('dateFilter'),
  resetFiltersBtn: document.getElementById('resetFiltersBtn'),

  bookingTableBody: document.getElementById('bookingTableBody'),
  emptyState: document.getElementById('emptyState'),
  adminBookingTableBody: document.getElementById('adminBookingTableBody'),
  adminEmptyState: document.getElementById('adminEmptyState'),
  adminMembershipOrdersList: document.getElementById('adminMembershipOrdersList'),
  adminMembershipEmptyState: document.getElementById('adminMembershipEmptyState'),

  openBookingBtn: document.getElementById('openBookingBtn'),
  dialog: document.getElementById('bookingDialog'),
  dialogTitle: document.getElementById('dialogTitle'),
  closeDialogBtn: document.getElementById('closeDialogBtn'),
  cancelDialogBtn: document.getElementById('cancelDialogBtn'),
  bookingForm: document.getElementById('bookingForm'),
  bookingId: document.getElementById('bookingId'),
  serviceName: document.getElementById('serviceName'),
  bookingDate: document.getElementById('bookingDate'),
  bookingTime: document.getElementById('bookingTime'),
  bookingNotes: document.getElementById('bookingNotes'),
};

let isRegisterMode = false;
let isForgotPasswordMode = false;
let signupStage = 'details';
let pendingSignupEmail = '';
let forgotPasswordStage = 'email';
let pendingForgotEmail = '';
let profilePreviewObjectUrl = '';
let availabilityRequestId = 0;
let adminCustomerRefreshTimer = 0;

bootstrap();

async function bootstrap() {
  attachEvents();
  populateTimeSlots();
  await loadCurrentUser();
  if (state.user) {
    await loadProfile();
    await loadDashboardData();
  }
  render();
}

function attachEvents() {
  elements.authSwitchBtn.addEventListener('click', () => {
    isRegisterMode = !isRegisterMode;
    isForgotPasswordMode = false;
    signupStage = 'details';
    pendingSignupEmail = '';
    forgotPasswordStage = 'email';
    pendingForgotEmail = '';
    elements.authOtp.value = '';
    elements.authForm.reset();
    renderAuthMode();
  });

  elements.forgotPasswordBtn.addEventListener('click', () => {
    if (isForgotPasswordMode) {
      isForgotPasswordMode = false;
      forgotPasswordStage = 'email';
      pendingForgotEmail = '';
      elements.authOtp.value = '';
      elements.authPassword.value = '';
      renderAuthMode();
      return;
    }

    isRegisterMode = false;
    isForgotPasswordMode = true;
    forgotPasswordStage = 'email';
    pendingForgotEmail = '';
    elements.authOtp.value = '';
    elements.authPassword.value = '';
    renderAuthMode();
  });

  elements.authForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await submitAuth();
  });

  elements.logoutBtn.addEventListener('click', async () => {
    await api('/api/auth/logout', { method: 'POST' });
    state.user = null;
    state.bookings = [];
    state.services = [];
    state.adminMembershipOrders = [];
    state.adminResolvedCustomer = null;
    state.adminCustomerForm = { name: '', email: '', phone: '' };
    state.postLoginChoice = '';
    state.activeUserTab = 'services';
    clearTimeout(adminCustomerRefreshTimer);
    state.membership = { plans: [], active: false, current: null };
    state.membershipAdditions = {};
    state.membershipCheckout = null;
    state.ivSelections = {};
    state.selectedServiceCategory = null;
    state.selectedSingleSessionServiceName = '';
    state.singleSessionEditingBookingId = '';
    state.selectedHydrogenServiceName = '';
    state.selectedHydrogenExtraSessions = 0;
    state.selectedHydrogenSlots = [];
    state.selectedHydrogenAddOnServiceName = '';
    state.selectedHydrogenAddOnSessionIndex = 0;
    state.hydrogenEditingGroupId = '';
    state.activeHydrogenSessionIndex = 0;
    state.activeHydrogenSessionDate = '';
    state.activeHydrogenSessionTime = '';
    state.selectedServiceDate = '';
    state.slotAvailability = {};
    state.slotCapacityByService = {};
    state.slotAvailabilityLoading = false;
    isForgotPasswordMode = false;
    signupStage = 'details';
    pendingSignupEmail = '';
    forgotPasswordStage = 'email';
    pendingForgotEmail = '';
    elements.authOtp.value = '';
    if (elements.dialog.open) elements.dialog.close();
    if (elements.profileDialog.open) elements.profileDialog.close();
    if (elements.membershipDialog?.open) elements.membershipDialog.close();
    renderAuthMode();
    render();
  });
  const updateAdminCustomerField = (field) => (event) => {
    state.adminCustomerForm[field] = String(event.target.value || '').trim();
    if (state.user?.role === 'admin') {
      clearTimeout(adminCustomerRefreshTimer);
      adminCustomerRefreshTimer = window.setTimeout(() => {
        refreshAdminCustomerContext().catch((error) => {
          setAdminCustomerMessage(error.message || 'Unable to load customer services.');
        });
      }, 300);
    }
  };
  elements.adminCustomerName?.addEventListener('input', updateAdminCustomerField('name'));
  elements.adminCustomerPhone?.addEventListener('input', updateAdminCustomerField('phone'));
  elements.adminCustomerEmail?.addEventListener('input', updateAdminCustomerField('email'));
  elements.adminCustomerName?.addEventListener('change', async () => {
    await refreshAdminCustomerContext().catch(() => {});
  });
  elements.adminCustomerEmail?.addEventListener('change', async () => {
    await refreshAdminCustomerContext().catch(() => {});
  });
  elements.adminCustomerPhone?.addEventListener('change', async () => {
    await refreshAdminCustomerContext().catch(() => {});
  });

  elements.profileBtn.addEventListener('click', openProfileDialog);
  elements.continueAsMemberBtn?.addEventListener('click', () => {
    state.postLoginChoice = 'member';
    state.activeUserTab = 'membership';
    render();
    requestAnimationFrame(() => {
      document.querySelector('[aria-label="Membership"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  elements.continueAsNonMemberBtn?.addEventListener('click', () => {
    state.postLoginChoice = 'non-member';
    state.activeUserTab = 'services';
    render();
    requestAnimationFrame(() => {
      document.querySelector('[aria-label="Services"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  elements.userTabServices?.addEventListener('click', () => {
    if (state.activeUserTab !== 'services') {
      resetServiceBrowserState();
    }
    state.activeUserTab = 'services';
    render();
  });
  elements.userTabMembership?.addEventListener('click', () => {
    resetServiceBrowserState();
    state.activeUserTab = 'membership';
    render();
  });
  elements.userTabBookings?.addEventListener('click', () => {
    resetServiceBrowserState();
    state.activeUserTab = 'bookings';
    render();
  });
  elements.membershipBackBtn?.addEventListener('click', () => {
    state.postLoginChoice = '';
    state.activeUserTab = 'services';
    render();
    requestAnimationFrame(() => {
      elements.memberChoiceGate?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  elements.membershipNextBtn?.addEventListener('click', () => {
    resetServiceBrowserState();
    state.activeUserTab = 'services';
    render();
    requestAnimationFrame(() => {
      elements.servicesSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  elements.servicesBackBtn?.addEventListener('click', () => {
    resetServiceBrowserState();
    if (state.postLoginChoice === 'member') {
      state.activeUserTab = 'membership';
      render();
      requestAnimationFrame(() => {
        elements.membershipSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }
    state.postLoginChoice = '';
    state.activeUserTab = 'services';
    render();
    requestAnimationFrame(() => {
      elements.memberChoiceGate?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  elements.servicesNextBtn?.addEventListener('click', () => {
    resetServiceBrowserState();
    state.activeUserTab = 'bookings';
    render();
    requestAnimationFrame(() => {
      elements.userBookingsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  elements.bookingsBackBtn?.addEventListener('click', () => {
    resetServiceBrowserState();
    state.activeUserTab = 'services';
    render();
    requestAnimationFrame(() => {
      elements.servicesSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  elements.bookingsPayAllBtn?.addEventListener('click', async () => {
    await payAllUserBookings();
  });
  elements.closeProfileDialogBtn.addEventListener('click', closeProfileDialog);
  elements.cancelProfileBtn.addEventListener('click', closeProfileDialog);
  elements.profileForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitBtn = elements.profileForm.querySelector('button[type="submit"]');
    const originalLabel = submitBtn ? submitBtn.textContent : '';
    try {
      elements.profileFormMessage.textContent = '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
      }
      await saveProfile();
    } catch (error) {
      elements.profileFormMessage.textContent = error.message || 'Unable to save profile.';
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel || 'Save Profile';
      }
    }
  });
  elements.profileAvatarFile.addEventListener('change', handleProfileAvatarSelection);

  elements.closeMembershipDialogBtn?.addEventListener('click', closeMembershipDialog);
  elements.cancelMembershipBtn?.addEventListener('click', closeMembershipDialog);
  elements.membershipForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    await submitMembershipCheckout();
  });

  elements.openBookingBtn.addEventListener('click', () => openDialog());
  elements.bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await upsertBooking();
  });
  elements.closeDialogBtn.addEventListener('click', closeDialog);
  elements.cancelDialogBtn.addEventListener('click', closeDialog);

  elements.searchInput.addEventListener('input', (event) => {
    state.filters.search = event.target.value.trim().toLowerCase();
    render();
  });
  elements.statusFilter.addEventListener('change', (event) => {
    state.filters.status = event.target.value;
    render();
  });
  elements.dateFilter.addEventListener('change', (event) => {
    state.filters.date = event.target.value;
    render();
  });
  elements.resetFiltersBtn.addEventListener('click', () => {
    state.filters = { search: '', status: 'all', date: '' };
    elements.searchInput.value = '';
    elements.statusFilter.value = 'all';
    elements.dateFilter.value = '';
    render();
  });

  renderAuthMode();
}

function renderAuthMode(preserveMessage = false) {
  if (!preserveMessage) elements.authError.textContent = '';
  const isSignupDetailsStep = isRegisterMode && signupStage === 'details';
  const isSignupOtpStep = isRegisterMode && signupStage === 'otp';
  const isSignupPasswordStep = isRegisterMode && signupStage === 'password';
  const isForgotEmailStep = !isRegisterMode && isForgotPasswordMode && forgotPasswordStage === 'email';
  const isForgotOtpStep = !isRegisterMode && isForgotPasswordMode && forgotPasswordStage === 'otp';
  const isForgotPasswordStep = !isRegisterMode && isForgotPasswordMode && forgotPasswordStage === 'password';
  const isLoginStep = !isRegisterMode && !isForgotPasswordMode;
  const authPasswordWrap = elements.authPassword.parentElement;

  elements.authNameWrap.hidden = !isSignupDetailsStep;
  elements.authRoleWrap.hidden = true;
  elements.authOtpWrap.hidden = !(isSignupOtpStep || isForgotOtpStep);
  authPasswordWrap.hidden = !(isLoginStep || isSignupPasswordStep || isForgotPasswordStep);

  elements.authName.required = isSignupDetailsStep;
  elements.authPassword.required = isLoginStep || isSignupPasswordStep || isForgotPasswordStep;
  elements.authOtp.required = isSignupOtpStep || isForgotOtpStep;
  elements.authEmail.readOnly = isSignupOtpStep || isSignupPasswordStep || isForgotOtpStep || isForgotPasswordStep;

  if ((isSignupOtpStep || isSignupPasswordStep) && pendingSignupEmail) {
    elements.authEmail.value = pendingSignupEmail;
  }
  if ((isForgotOtpStep || isForgotPasswordStep) && pendingForgotEmail) {
    elements.authEmail.value = pendingForgotEmail;
  }

  if (isSignupDetailsStep) {
    elements.authTitle.textContent = 'Create your account';
    elements.authSubmitBtn.textContent = 'Send Signup OTP';
  } else if (isSignupOtpStep) {
    elements.authTitle.textContent = 'Verify signup OTP';
    elements.authSubmitBtn.textContent = 'Verify OTP';
  } else if (isSignupPasswordStep) {
    elements.authTitle.textContent = 'Set password';
    elements.authSubmitBtn.textContent = 'Complete Signup';
  } else if (isForgotEmailStep) {
    elements.authTitle.textContent = 'Forgot password';
    elements.authSubmitBtn.textContent = 'Send Reset OTP';
  } else if (isForgotOtpStep) {
    elements.authTitle.textContent = 'Verify reset OTP';
    elements.authSubmitBtn.textContent = 'Verify OTP';
  } else if (isForgotPasswordStep) {
    elements.authTitle.textContent = 'Set new password';
    elements.authSubmitBtn.textContent = 'Reset Password';
  } else {
    elements.authTitle.textContent = 'Sign in to continue';
    elements.authSubmitBtn.textContent = 'Sign in';
  }

  elements.authSwitchText.textContent = isRegisterMode
    ? 'Already have an account?'
    : "Don't have an account?";
  elements.authSwitchBtn.textContent = isRegisterMode ? 'Sign in' : 'Register';
  elements.forgotPasswordBtn.textContent = isForgotPasswordMode ? 'Back to sign in' : 'Forgot password?';
  elements.forgotPasswordBtn.hidden = isRegisterMode;
}

async function submitAuth() {
  elements.authError.textContent = '';

  try {
    if (!isRegisterMode && !isForgotPasswordMode) {
      const email = elements.authEmail.value.trim();
      const password = elements.authPassword.value;
      const result = await api('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      state.user = result.user;
      state.postLoginChoice = '';
      state.activeUserTab = 'services';
      elements.authForm.reset();
      await loadProfile();
      await loadDashboardData();
      render();
      return;
    }

    if (isForgotPasswordMode) {
      if (forgotPasswordStage === 'email') {
        const email = elements.authEmail.value.trim();
        const result = await api('/api/auth/password/forgot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        pendingForgotEmail = email;
        forgotPasswordStage = 'otp';
        elements.authOtp.value = '';
        elements.authError.textContent = result.message || 'Password reset OTP sent.';
        renderAuthMode(true);
        return;
      }

      if (forgotPasswordStage === 'otp') {
        const otp = elements.authOtp.value.trim();
        const result = await api('/api/auth/password/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: pendingForgotEmail || elements.authEmail.value.trim(),
            otp,
          }),
        });

        forgotPasswordStage = 'password';
        elements.authPassword.value = '';
        elements.authError.textContent = result.message || 'OTP verified. Set your new password.';
        renderAuthMode(true);
        return;
      }

      const password = elements.authPassword.value;
      const result = await api('/api/auth/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingForgotEmail || elements.authEmail.value.trim(),
          password,
        }),
      });

      isForgotPasswordMode = false;
      forgotPasswordStage = 'email';
      pendingForgotEmail = '';
      elements.authOtp.value = '';
      elements.authPassword.value = '';
      elements.authError.textContent = result.message || 'Password reset successful. Please login.';
      renderAuthMode(true);
      return;
    }

    if (signupStage === 'details') {
      const name = elements.authName.value.trim();
      const email = elements.authEmail.value.trim();
      if (!name) {
        elements.authError.textContent = 'Name is required.';
        return;
      }

      const result = await api('/api/auth/register/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      pendingSignupEmail = email;
      signupStage = 'otp';
      elements.authOtp.value = '';
      elements.authError.textContent = result.message || 'Signup OTP sent.';
      renderAuthMode(true);
      return;
    }

    if (signupStage === 'otp') {
      const otp = elements.authOtp.value.trim();
      const result = await api('/api/auth/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingSignupEmail || elements.authEmail.value.trim(),
          otp,
        }),
      });

      signupStage = 'password';
      elements.authPassword.value = '';
      elements.authError.textContent = result.message || 'OTP verified. Set your password.';
      renderAuthMode(true);
      return;
    }

    const password = elements.authPassword.value;
    const result = await api('/api/auth/register/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: pendingSignupEmail || elements.authEmail.value.trim(),
        password,
      }),
    });

    state.user = result.user;
    state.postLoginChoice = '';
    state.activeUserTab = 'services';
    signupStage = 'details';
    pendingSignupEmail = '';
    elements.authForm.reset();
    await loadProfile();
    await loadDashboardData();
    render();
  } catch (error) {
    elements.authError.textContent = error.message;
  }
}

async function loadCurrentUser() {
  try {
    const result = await api('/api/auth/me');
    state.user = result.user;
  } catch {
    state.user = null;
  }
}

async function loadProfile() {
  const result = await api('/api/profile');
  state.user = { ...state.user, ...result.profile };
}

function isAdminCustomerFormReady() {
  return Boolean(
    String(state.adminCustomerForm.name || '').trim() &&
      String(state.adminCustomerForm.email || '').trim() &&
      String(state.adminCustomerForm.phone || '').trim()
  );
}

function setAdminCustomerMessage(message = '') {
  if (!elements.adminCustomerMessage) return;
  const text = String(message || '').trim();
  elements.adminCustomerMessage.textContent = text;
  elements.adminCustomerMessage.hidden = !text;
}

async function refreshAdminCustomerContext() {
  if (state.user?.role !== 'admin') return;
  clearTimeout(adminCustomerRefreshTimer);
    state.ivSelections = {};
    state.selectedSingleSessionServiceName = '';
    state.singleSessionEditingBookingId = '';
    resetHydrogenComposer();
  state.selectedServiceDate = getTodayIsoDate();
  state.slotAvailability = {};
  state.slotCapacityByService = {};
  state.slotAvailabilityLoading = false;
  try {
    await loadDashboardData();
    if (!isAdminCustomerFormReady()) {
      setAdminCustomerMessage('Booking page is ready. Enter customer details before saving the booking.');
    } else if (state.adminResolvedCustomer?.membershipStatus === 'active') {
      setAdminCustomerMessage('Active membership found. Member pricing and membership-only services are loaded.');
    } else {
      setAdminCustomerMessage('Customer details loaded. Standard booking flow is ready.');
    }
  } catch (error) {
    setAdminCustomerMessage(error.message || 'Unable to refresh customer-specific pricing. Standard booking flow is still available.');
  }
  render();
}

async function loadDashboardData() {
  if (state.user?.role === 'admin') {
    const [bookingsResult, membershipOrdersResult, genericServicesResult] = await Promise.all([
      api('/api/bookings'),
      api('/api/admin/membership-orders'),
      api('/api/services'),
    ]);
    state.bookings = bookingsResult.bookings || [];
    state.adminMembershipOrders = membershipOrdersResult.orders || [];
    state.membership = { plans: [], active: false, current: null };
    state.services = (genericServicesResult.services || []).filter((service) => !service.membershipOnly);
    state.adminResolvedCustomer = null;

    if (isAdminCustomerFormReady()) {
      try {
        const servicesResult = await api('/api/admin/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: state.adminCustomerForm.name,
            customerEmail: state.adminCustomerForm.email,
            customerPhone: state.adminCustomerForm.phone,
          }),
        });
        state.services = servicesResult.services || state.services;
        state.adminResolvedCustomer = servicesResult.resolvedCustomer || null;
      } catch {
        state.adminResolvedCustomer = null;
      }
    }
  } else {
    const [servicesResult, bookingsResult, membershipResult] = await Promise.all([
      api('/api/services'),
      api('/api/bookings'),
      api('/api/membership/plans'),
    ]);
    state.services = servicesResult.services || [];
    state.bookings = bookingsResult.bookings || [];
    state.membership = {
      plans: membershipResult.plans || [],
      active: Boolean(membershipResult.active),
      current: membershipResult.current || null,
    };
    state.adminMembershipOrders = [];
    state.adminResolvedCustomer = null;
    state.adminCustomerForm = { name: '', email: '', phone: '' };
  }

  if (state.selectedServiceCategory) {
    const stillExists = state.services.some(
      (service) => String(service.category || '').toUpperCase() === state.selectedServiceCategory
    );
    if (!stillExists) state.selectedServiceCategory = null;
  }
  if (state.selectedHydrogenServiceName) {
    const hydrogenServiceExists = state.services.some((service) => String(service.name || '') === state.selectedHydrogenServiceName);
    if (!hydrogenServiceExists) state.selectedHydrogenServiceName = '';
  }
  if (!state.selectedServiceDate) {
    state.selectedServiceDate = getTodayIsoDate();
  }
  if (state.selectedServiceCategory) {
    await loadServiceAvailability();
  }
}

async function loadServiceAvailability() {
  if (!state.selectedServiceCategory || !state.selectedServiceDate) return;
  if (state.user?.role === 'admin' && !isAdminCustomerFormReady()) return;
  const requestId = ++availabilityRequestId;
  state.slotAvailabilityLoading = true;
  renderServices();

  try {
    const params = new URLSearchParams({
      bookingDate: state.selectedServiceDate,
      category: state.selectedServiceCategory,
    });
    if (state.user?.role === 'admin') {
      params.set('customerEmail', state.adminCustomerForm.email);
    }
    const result = await api(`/api/services/availability?${params.toString()}`);
    if (requestId !== availabilityRequestId) return;
    state.slotAvailability = result.availability || {};
    state.slotCapacityByService = result.slotCapacityByService || {};
  } catch {
    if (requestId !== availabilityRequestId) return;
    state.slotAvailability = {};
    state.slotCapacityByService = {};
  } finally {
    if (requestId !== availabilityRequestId) return;
    state.slotAvailabilityLoading = false;
    renderServices();
  }
}

function refreshSelectedCategoryAvailability(bookingDate = '') {
  state.selectedServiceDate = bookingDate || getTodayIsoDate();
  state.slotAvailability = {};
  state.slotCapacityByService = {};
  state.slotAvailabilityLoading = true;
  render();
  loadServiceAvailability();
}

function resetServiceBrowserState() {
  resetHydrogenComposer();
  resetSingleSessionComposer();
  state.selectedServiceCategory = null;
  state.selectedServiceDate = getTodayIsoDate();
  state.slotAvailability = {};
  state.slotCapacityByService = {};
  state.slotAvailabilityLoading = false;
}

function getHydrogenSlotsForSubmit(requiredSlots) {
  const slots = state.selectedHydrogenSlots.slice(0, requiredSlots);
  const activeIndex = Number(state.activeHydrogenSessionIndex || 0);
  if (activeIndex >= 0 && activeIndex < requiredSlots && state.activeHydrogenSessionDate && state.activeHydrogenSessionTime) {
    slots[activeIndex] = {
      bookingDate: state.activeHydrogenSessionDate,
      bookingTime: state.activeHydrogenSessionTime,
    };
  }
  return slots;
}

function populateAvailableTimeOptions(selectElement, serviceName, bookingDate, currentReservedSlot = null) {
  if (!selectElement) return;
  const selectedValue = String(selectElement.value || '');
  selectElement.innerHTML = '';

  const serviceAvailability = state.slotAvailability[String(serviceName || '')] || {};
  const capacity = Number(state.slotCapacityByService[String(serviceName || '')] || 1);
  const reservedDate = String(currentReservedSlot?.bookingDate || '').trim();
  const reservedTime = String(currentReservedSlot?.bookingTime || '').trim();

  for (const optionData of SLOT_OPTIONS) {
    const booked = Number(serviceAvailability[optionData.value] || 0);
    const isCurrentReserved = bookingDate === reservedDate && optionData.value === reservedTime;
    const isFull = booked >= capacity && !isCurrentReserved;
    const option = document.createElement('option');
    option.value = optionData.value;
    option.textContent = isFull ? `${optionData.label} (Full)` : optionData.label;
    option.disabled = isFull;
    selectElement.appendChild(option);
  }

  const hasSelected = [...selectElement.options].some((option) => option.value === selectedValue && !option.disabled);
  if (hasSelected) {
    selectElement.value = selectedValue;
    return;
  }

  const fallback = [...selectElement.options].find((option) => !option.disabled);
  selectElement.value = fallback?.value || SLOT_OPTIONS[0].value;
}

function populateTimeSlots() {
  elements.bookingTime.innerHTML = '';
  for (const slot of SLOT_OPTIONS) {
    const option = document.createElement('option');
    option.value = slot.value;
    option.textContent = slot.label;
    elements.bookingTime.appendChild(option);
  }
}

function populateServiceOptions(selectedService = '') {
  elements.serviceName.innerHTML = '';
  for (const service of state.services) {
    const option = document.createElement('option');
    option.value = service.name;
    const isIncluded = Boolean(service.membershipOnly);
    option.textContent = isIncluded
      ? `${service.name} - Included in Membership`
      : `${service.name} - Rs. ${Number(service.effectivePriceInr ?? service.priceInr ?? 0).toLocaleString('en-IN')}`;
    option.dataset.category = service.category;
    elements.serviceName.appendChild(option);
  }

  if (selectedService) {
    const hasMatch = state.services.some((service) => service.name === selectedService);
    if (hasMatch) elements.serviceName.value = selectedService;
  }
}

function populateBookingDateOptions(selectedDate = '') {
  const options = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  for (let i = 0; i <= BOOKING_WINDOW_DAYS; i += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, '0');
    const date = String(day.getDate()).padStart(2, '0');
    const iso = `${year}-${month}-${date}`;
    const label = new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(day);
    options.push({ value: iso, label });
  }

  elements.bookingDate.innerHTML = '';
  for (const optionData of options) {
    const option = document.createElement('option');
    option.value = optionData.value;
    option.textContent = optionData.label;
    elements.bookingDate.appendChild(option);
  }

  if (options.length === 0) return;
  const hasSelected = options.some((option) => option.value === selectedDate);
  elements.bookingDate.value = hasSelected ? selectedDate : options[0].value;
}

function openDialog(booking = null) {
  populateServiceOptions();
  populateTimeSlots();
  elements.serviceName.disabled = false;

  if (booking) {
    elements.dialogTitle.textContent = 'Edit Booking';
    elements.bookingId.value = String(booking.id);
    populateServiceOptions(booking.serviceName);
    populateBookingDateOptions(booking.bookingDate);
    elements.bookingTime.value = booking.bookingTime;
    elements.bookingNotes.value = booking.notes || '';
    elements.serviceName.disabled = Boolean(booking.bookingGroupId);
  } else {
    elements.dialogTitle.textContent = 'Book Slot';
    elements.bookingForm.reset();
    elements.bookingId.value = '';
    populateServiceOptions();
    populateBookingDateOptions();
    elements.bookingTime.value = SLOT_OPTIONS[0].value;
  }

  elements.dialog.showModal();
}

function closeDialog() {
  elements.dialog.close();
}

function openProfileDialog() {
  if (!state.user) return;

  elements.profileFormMessage.textContent = '';
  elements.profileName.value = state.user.name || '';
  elements.profileAge.value = state.user.age ?? '';
  elements.profileGender.value = state.user.gender || '';
  elements.profileMobile.value = state.user.mobile || '';
  elements.profileAvatarFile.value = '';
  setProfilePreview(state.user.avatarUrl || '');
  elements.profileDialog.showModal();
}

function closeProfileDialog() {
  elements.profileFormMessage.textContent = '';
  clearProfilePreviewObjectUrl();
  elements.profileDialog.close();
  renderProfileAvatar();
}

async function saveProfile() {
  if (elements.profileAvatarFile.files && elements.profileAvatarFile.files[0]) {
    const formData = new FormData();
    formData.append('avatar', elements.profileAvatarFile.files[0]);
    const uploadResult = await api('/api/profile/avatar', {
      method: 'POST',
      body: formData,
    });
    state.user = {
      ...state.user,
      ...uploadResult.profile,
      avatarUrl: withCacheBuster(uploadResult.profile.avatarUrl || ''),
    };
  }

  const payload = {
    name: elements.profileName.value.trim(),
    age: elements.profileAge.value.trim(),
    gender: elements.profileGender.value,
    mobile: elements.profileMobile.value.trim(),
  };

  const result = await api('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  state.user = {
    ...state.user,
    ...result.profile,
    avatarUrl: withCacheBuster(result.profile.avatarUrl || state.user.avatarUrl || ''),
  };

  closeProfileDialog();
  render();
}

function handleProfileAvatarSelection() {
  clearProfilePreviewObjectUrl();
  const file = elements.profileAvatarFile.files?.[0];
  if (!file) {
    setProfilePreview(state.user?.avatarUrl || '');
    renderProfileAvatar();
    return;
  }

  profilePreviewObjectUrl = URL.createObjectURL(file);
  setProfilePreview(profilePreviewObjectUrl);
  elements.profileAvatar.textContent = '';
  elements.profileAvatar.style.backgroundImage = `url("${profilePreviewObjectUrl}")`;
  elements.profileAvatar.classList.add('has-image');
}

function clearProfilePreviewObjectUrl() {
  if (profilePreviewObjectUrl) {
    URL.revokeObjectURL(profilePreviewObjectUrl);
    profilePreviewObjectUrl = '';
  }
}

function setProfilePreview(src) {
  const normalized = normalizeAvatarUrl(src);
  if (!normalized) {
    elements.profileAvatarPreview.removeAttribute('src');
    elements.profileAvatarPreview.classList.remove('has-preview');
    return;
  }

  elements.profileAvatarPreview.src = normalized;
  elements.profileAvatarPreview.classList.add('has-preview');
}

async function upsertBooking() {
  const payload = {
    serviceName: elements.serviceName.value,
    bookingDate: elements.bookingDate.value,
    bookingTime: elements.bookingTime.value,
    notes: elements.bookingNotes.value.trim(),
  };
  const isAdmin = state.user?.role === 'admin';
  if (isAdmin) {
    if (!isAdminCustomerFormReady()) {
      alert('Enter customer name, email, and contact number first.');
      return;
    }
    payload.customerName = state.adminCustomerForm.name;
    payload.customerEmail = state.adminCustomerForm.email;
    payload.customerPhone = state.adminCustomerForm.phone;
  }

  const id = elements.bookingId.value;
  if (id) {
    await api(`/api/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } else {
    await api(isAdmin ? '/api/admin/bookings' : '/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  await loadDashboardData();
  closeDialog();
  render();
}

async function changeStatus(id, status) {
  await api(`/api/bookings/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  await loadDashboardData();
  render();
}

async function copyBookingPaymentLink(id) {
  const result = await api(`/api/bookings/${id}/payment-link`);
  copyTextToClipboard(result.paymentLinkUrl || '');
  alert(`Payment Link\n\n${result.paymentLinkUrl}\n\nPayment link copied.`);
}

async function payBooking(id) {
  const result = await api('/api/payments/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId: id }),
  });

  if (!window.Razorpay) {
    throw new Error('Razorpay SDK not loaded');
  }

  const options = {
    key: result.keyId,
    amount: result.amount,
    currency: result.currency || 'INR',
    name: 'H2 House Of Health',
    description: `${result.booking.serviceName}`,
    order_id: result.orderId,
    prefill: {
      name: result.user?.name || '',
      email: result.user?.email || '',
    },
    theme: {
      color: '#8b5e3c',
    },
    handler: async (response) => {
      try {
        const verifyResult = await api('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });
        await loadDashboardData();
        render();
        const bookingCount = Number(verifyResult.bookingCount || result.bookingCount || 1);
        const totalAmountInr = Number(result.summary?.totalAmountInr || result.booking?.amountInr || 0);
        alert(
          bookingCount > 1
            ? `Payment successful. ${bookingCount} booking(s) marked as booked. Total paid: Rs. ${totalAmountInr.toLocaleString(
                'en-IN'
              )}.`
            : `Payment successful. Booking marked as booked. Amount paid: Rs. ${totalAmountInr.toLocaleString('en-IN')}.`
        );
      } catch (error) {
        await loadDashboardData();
        render();
        alert(error.message || 'Payment verification failed.');
      }
    },
    modal: {
      ondismiss: async () => {
        await loadDashboardData();
        render();
        alert('Payment was canceled.');
      },
    },
  };

  const checkout = new window.Razorpay(options);
  checkout.open();
}

async function payAllUserBookings() {
  const result = await api('/api/payments/create-cart-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  if (!window.Razorpay) {
    throw new Error('Razorpay SDK not loaded');
  }

  const options = {
    key: result.keyId,
    amount: result.amount,
    currency: result.currency || 'INR',
    name: 'H2 House Of Health',
    description: `My Bookings Payment`,
    order_id: result.orderId,
    prefill: {
      name: result.user?.name || '',
      email: result.user?.email || '',
    },
    theme: {
      color: '#8b5e3c',
    },
    handler: async (response) => {
      try {
        const verifyResult = await api('/api/payments/verify-cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });
        await loadDashboardData();
        render();
        alert(
          `Payment successful. ${Number(verifyResult.unitCount || 0)} item(s) paid in one checkout. Total paid: Rs. ${Number(
            verifyResult.totalAmountInr || result.summary?.totalAmountInr || 0
          ).toLocaleString('en-IN')}.`
        );
      } catch (error) {
        await loadDashboardData();
        render();
        alert(error.message || 'Payment verification failed.');
      }
    },
    modal: {
      ondismiss: async () => {
        await loadDashboardData();
        render();
        alert('Payment was canceled.');
      },
    },
  };

  const checkout = new window.Razorpay(options);
  checkout.open();
}

async function saveHydrogenPackBookings({ serviceName, extraSessions, slots, addOnServiceName, addOnSessionIndex }) {
  const isAdmin = state.user?.role === 'admin';
  if (isAdmin && !isAdminCustomerFormReady()) {
    alert('Enter customer name, email, and contact number first.');
    return;
  }
  const dailyLimitConflict = findHydrogenDailyLimitConflictClient(slots);
  if (dailyLimitConflict) {
    alert(
      `Only ${MAX_HYDROGEN_SESSIONS_PER_DAY_PER_USER} hydrogen sessions can be booked in one day. Check ${dailyLimitConflict.bookingDate}.`
    );
    return;
  }
  if (!isAdmin && addOnServiceName) {
    const addOnSlot = slots?.[Number(addOnSessionIndex || 0)];
    const cooldownConflict = findIvCooldownConflictClient(addOnServiceName, addOnSlot?.bookingDate || '');
    if (cooldownConflict) {
      alert(getIvCooldownAlertMessage(cooldownConflict));
      return;
    }
  }

  const result = await api(isAdmin ? '/api/admin/hydrogen/book-pack' : '/api/hydrogen/book-pack', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...(isAdmin
        ? {
            customerName: state.adminCustomerForm.name,
            customerEmail: state.adminCustomerForm.email,
            customerPhone: state.adminCustomerForm.phone,
          }
        : {}),
      serviceName,
      extraSessions,
      slots,
      addOnServiceName,
      addOnSessionIndex,
    }),
  });

  const summary = result.summary || {};
  const addOn = summary.addOn || null;
  const lines = [
    `Service: ${serviceName}`,
    `Hydrogen Amount: Rs. ${Number(summary.packagePriceInr || 0).toLocaleString('en-IN')}`,
    `Extra Sessions: ${Number(summary.extraSessions || 0)} x Rs. ${Number(summary.extraSessionPriceInr || 0).toLocaleString('en-IN')}`,
    addOn ? `IV Add-on: ${addOn.serviceName} - Rs. ${Number(addOn.amountInr || 0).toLocaleString('en-IN')}` : 'IV Add-on: None',
    `Total Session Payment: Rs. ${Number(summary.totalAmountInr || 0).toLocaleString('en-IN')}`,
    '',
    isAdmin ? 'Saved to All User Bookings.' : 'Saved to My Bookings.',
    isAdmin ? 'Payment can be managed later from the bookings list.' : 'Use Pay Now there when you are ready to complete the payment.',
  ];

  state.selectedHydrogenSlots = [];
  state.selectedHydrogenExtraSessions = 0;
  state.selectedHydrogenAddOnServiceName = '';
  state.selectedHydrogenAddOnSessionIndex = 0;
  state.activeHydrogenSessionIndex = 0;
  state.activeHydrogenSessionDate = '';
  state.activeHydrogenSessionTime = '';
  state.selectedServiceCategory = null;
  state.selectedHydrogenServiceName = '';
  await loadDashboardData();
  render();
  if (isAdmin && result.paymentLinkUrl) {
    copyTextToClipboard(result.paymentLinkUrl);
    lines.push('', `Payment Link: ${result.paymentLinkUrl}`, 'Payment link copied.');
  }
  alert(`${isAdmin ? 'Booking Saved' : 'Booking Saved'}\n\n${lines.join('\n')}`);
}

async function updateHydrogenPackBookings({ bookingGroupId, serviceName, extraSessions, slots, addOnServiceName, addOnSessionIndex }) {
  const dailyLimitConflict = findHydrogenDailyLimitConflictClient(slots, bookingGroupId);
  if (dailyLimitConflict) {
    alert(
      `Only ${MAX_HYDROGEN_SESSIONS_PER_DAY_PER_USER} hydrogen sessions can be booked in one day. Check ${dailyLimitConflict.bookingDate}.`
    );
    return;
  }
  if (addOnServiceName) {
    const addOnSlot = slots?.[Number(addOnSessionIndex || 0)];
    const cooldownConflict = findIvCooldownConflictClient(addOnServiceName, addOnSlot?.bookingDate || '', '', bookingGroupId);
    if (cooldownConflict) {
      alert(getIvCooldownAlertMessage(cooldownConflict));
      return;
    }
  }

  const result = await api(`/api/hydrogen/packages/${encodeURIComponent(bookingGroupId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      serviceName,
      extraSessions,
      slots,
      addOnServiceName,
      addOnSessionIndex,
    }),
  });

  const summary = result.summary || {};
  const addOn = summary.addOn || null;
  const lines = [
    `Service: ${serviceName}`,
    `Hydrogen Amount: Rs. ${Number(summary.packagePriceInr || 0).toLocaleString('en-IN')}`,
    `Extra Sessions: ${Number(summary.extraSessions || 0)} x Rs. ${Number(summary.extraSessionPriceInr || 0).toLocaleString('en-IN')}`,
    addOn ? `IV Add-on: ${addOn.serviceName} - Rs. ${Number(addOn.amountInr || 0).toLocaleString('en-IN')}` : 'IV Add-on: None',
    `Total Session Payment: Rs. ${Number(summary.totalAmountInr || 0).toLocaleString('en-IN')}`,
  ];

  resetHydrogenComposer();
  await loadDashboardData();
  if (state.user?.role !== 'admin') {
    state.activeUserTab = 'bookings';
  }
  render();
  if (state.user?.role !== 'admin') {
    requestAnimationFrame(() => {
      elements.userBookingsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  alert(`Booking Updated\n\n${lines.join('\n')}`);
}

async function deleteBooking(booking) {
  const ok = confirm(
    booking.bookingGroupId
      ? `Delete the full hydrogen booking package for ${booking.serviceName}?`
      : `Delete booking for ${booking.serviceName}?`
  );
  if (!ok) return;

  await api(`/api/bookings/${booking.id}`, { method: 'DELETE' });
  await loadDashboardData();
  if (booking.bookingGroupId && booking.bookingGroupId === state.hydrogenEditingGroupId) {
    resetHydrogenComposer();
  }
  render();
}

async function saveSingleSessionServiceBooking(serviceName) {
  const selection = state.ivSelections?.[serviceName] || {};
  const editingBookingId = String(selection.editingBookingId || state.singleSessionEditingBookingId || '');
  const effectiveBookingDate = String(
    editingBookingId ? selection.editingDate || selection.bookingDate || '' : selection.bookingDate || ''
  ).trim();
  const effectiveBookingTime = String(
    editingBookingId ? selection.editingTime || selection.bookingTime || '' : selection.bookingTime || ''
  ).trim();
  if (!effectiveBookingDate || !effectiveBookingTime) {
    alert('Set session date and time first.');
    return;
  }
  if (getBookingCategory(serviceName) === 'IV ADD-ON' && hasHydrogenPackageAddOnOnDateClient(effectiveBookingDate)) {
    alert(
      'A hydrogen package on this date already includes an IV add-on. Separate IV Therapy/IV Shot bookings are not allowed on the same day.'
    );
    return;
  }
  const cooldownConflict = findIvCooldownConflictClient(serviceName, effectiveBookingDate, editingBookingId);
  if (cooldownConflict) {
    alert(getIvCooldownAlertMessage(cooldownConflict));
    return;
  }

  const isAdmin = state.user?.role === 'admin';
  if (isAdmin && !isAdminCustomerFormReady()) {
    alert('Enter customer name, email, and contact number first.');
    return;
  }

  const result = await api(editingBookingId ? `/api/bookings/${encodeURIComponent(editingBookingId)}` : isAdmin ? '/api/admin/bookings' : '/api/bookings', {
    method: editingBookingId ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...(isAdmin
        ? {
            customerName: state.adminCustomerForm.name,
            customerEmail: state.adminCustomerForm.email,
            customerPhone: state.adminCustomerForm.phone,
          }
        : {}),
      serviceName,
      bookingDate: effectiveBookingDate,
      bookingTime: effectiveBookingTime,
      notes: selection.notes || '',
    }),
  });

  state.ivSelections[serviceName] = {
    editingDate: effectiveBookingDate,
    editingTime: effectiveBookingTime,
    bookingDate: '',
    bookingTime: '',
  };
  state.singleSessionEditingBookingId = '';
  await loadDashboardData();
  if (editingBookingId && !isAdmin) {
    state.activeUserTab = 'bookings';
  }
  render();
  if (editingBookingId && !isAdmin) {
    requestAnimationFrame(() => {
      elements.userBookingsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  if (isAdmin && result.paymentLinkUrl) {
    copyTextToClipboard(result.paymentLinkUrl);
    alert(`Booking saved to All User Bookings.\n\nPayment Link: ${result.paymentLinkUrl}\n\nPayment link copied.`);
    return;
  }
  alert(editingBookingId ? 'Booking updated.' : isAdmin ? 'Booking saved to All User Bookings.' : 'Booking saved to My Bookings.');
}

function resetHydrogenComposer({ keepCategory = false } = {}) {
  state.selectedHydrogenServiceName = '';
  state.selectedHydrogenExtraSessions = 0;
  state.selectedHydrogenSlots = [];
  state.selectedHydrogenAddOnServiceName = '';
  state.selectedHydrogenAddOnSessionIndex = 0;
  state.hydrogenEditingGroupId = '';
  state.activeHydrogenSessionIndex = 0;
  state.activeHydrogenSessionDate = '';
  state.activeHydrogenSessionTime = '';
  if (!keepCategory) {
    state.selectedServiceCategory = null;
  }
}

function resetSingleSessionComposer() {
  state.selectedSingleSessionServiceName = '';
  state.singleSessionEditingBookingId = '';
  state.ivSelections = {};
}

function openSingleSessionBookingEditor(booking) {
  const category = getBookingCategory(booking?.serviceName || '');
  if (!booking || !category || category === 'HYDROGEN SESSION') {
    openDialog(booking || null);
    return;
  }

  state.activeUserTab = 'services';
  state.selectedServiceCategory = category;
  state.selectedSingleSessionServiceName = booking.serviceName;
  state.singleSessionEditingBookingId = String(booking.id);
  state.ivSelections[booking.serviceName] = {
    editingBookingId: String(booking.id),
    bookingDate: booking.bookingDate,
    bookingTime: booking.bookingTime,
    editingDate: booking.bookingDate,
    editingTime: booking.bookingTime,
    notes: booking.notes || '',
    paymentStatus: booking.paymentStatus || 'unpaid',
  };
  refreshSelectedCategoryAvailability(booking.bookingDate);
  requestAnimationFrame(() => {
    document.querySelector(`[data-service-category="${category}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function openHydrogenPackageEditor(row) {
  const hydrogenEntries = [...(row.hydrogenEntries || [])].sort((a, b) =>
    `${a.bookingDate}T${a.bookingTime}`.localeCompare(`${b.bookingDate}T${b.bookingTime}`)
  );
  if (!hydrogenEntries.length) {
    alert('Hydrogen package data is incomplete.');
    return;
  }

  const addOnEntry = (row.addOnEntries || [])[0] || null;
  const addOnSessionIndex = addOnEntry
    ? Math.max(
        0,
        hydrogenEntries.findIndex(
          (entry) => entry.bookingDate === addOnEntry.bookingDate && entry.bookingTime === addOnEntry.bookingTime
        )
      )
    : 0;

  state.activeUserTab = 'services';
  state.selectedServiceCategory = 'HYDROGEN SESSION';
  state.selectedHydrogenServiceName = row.baseServiceName || hydrogenEntries[0].serviceName;
  state.selectedHydrogenExtraSessions = Math.max(0, Number(row.extraSessions || 0));
  state.selectedHydrogenSlots = hydrogenEntries.map((entry) => ({
    bookingDate: entry.bookingDate,
    bookingTime: entry.bookingTime,
  }));
  state.selectedHydrogenAddOnServiceName = addOnEntry?.serviceName || '';
  state.selectedHydrogenAddOnSessionIndex = addOnSessionIndex;
  state.hydrogenEditingGroupId = row.bookingGroupId || '';
  state.activeHydrogenSessionIndex = 0;
  state.activeHydrogenSessionDate = hydrogenEntries[0].bookingDate || getTodayIsoDate();
  state.activeHydrogenSessionTime = hydrogenEntries[0].bookingTime || SLOT_OPTIONS[0].value;
  state.selectedServiceDate = hydrogenEntries[0].bookingDate || getTodayIsoDate();
  refreshSelectedCategoryAvailability(hydrogenEntries[0].bookingDate || getTodayIsoDate());
  requestAnimationFrame(() => {
    const target = document.querySelector('[data-hydrogen-editor="true"]') || document.querySelector('[data-service-category="HYDROGEN SESSION"]');
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function getFilteredBookings(sourceBookings = state.bookings) {
  const { search, status, date } = state.filters;
  return sourceBookings
    .filter((item) => {
      if (status !== 'all' && item.status !== status) return false;
      if (date && item.bookingDate !== date) return false;
      if (!search) return true;

      const searchable = [item.clientName, item.clientMobile, item.serviceName]
        .join(' ')
        .toLowerCase();

      return searchable.includes(search);
    })
    .sort((a, b) => `${a.bookingDate}T${a.bookingTime}`.localeCompare(`${b.bookingDate}T${b.bookingTime}`));
}

function render() {
  const isAuthenticated = Boolean(state.user);
  document.body.classList.toggle('auth-mode', !isAuthenticated);
  elements.authCard.hidden = isAuthenticated;
  elements.appArea.hidden = !isAuthenticated;

  document.querySelectorAll('.app-only').forEach((el) => {
    el.hidden = !isAuthenticated;
  });

  if (!isAuthenticated) {
    document.querySelectorAll('.app-only, .user-only, .admin-only').forEach((el) => {
      el.hidden = true;
    });
    elements.bookingTableBody.innerHTML = '';
    elements.adminBookingTableBody.innerHTML = '';
    if (elements.adminMembershipOrdersList) elements.adminMembershipOrdersList.innerHTML = '';
    return;
  }

  const isAdmin = state.user.role === 'admin';
  const needsPostLoginChoice = state.user.role === 'user' && !state.postLoginChoice;
  document.querySelectorAll('.user-only').forEach((el) => {
    el.hidden = isAdmin;
  });
  document.querySelectorAll('.admin-only').forEach((el) => {
    el.hidden = !isAdmin;
  });

  if (elements.memberChoiceGate) {
    elements.memberChoiceGate.hidden = !needsPostLoginChoice;
  }
  if (elements.userTabNav) {
    elements.userTabNav.hidden = isAdmin || needsPostLoginChoice;
  }

  if (needsPostLoginChoice) {
    document.querySelectorAll('.app-only').forEach((el) => {
      if (el !== elements.memberChoiceGate) {
        el.hidden = true;
      }
    });
  }

  elements.userName.textContent = state.user.name;
  elements.userRole.textContent = state.user.role;
  renderProfileAvatar();
  renderServicePanelContext();

  if (needsPostLoginChoice) {
    return;
  }

  if (!isAdmin) {
    const activeTab = state.activeUserTab || 'services';
    if (elements.userTabServices) elements.userTabServices.classList.toggle('is-active', activeTab === 'services');
    if (elements.userTabMembership) elements.userTabMembership.classList.toggle('is-active', activeTab === 'membership');
    if (elements.userTabBookings) elements.userTabBookings.classList.toggle('is-active', activeTab === 'bookings');
    if (elements.membershipSection) elements.membershipSection.hidden = activeTab !== 'membership';
    if (elements.servicesSection) elements.servicesSection.hidden = activeTab !== 'services';
    if (elements.userBookingsSection) elements.userBookingsSection.hidden = activeTab !== 'bookings';
  } else {
    if (elements.bookingFiltersSection) elements.bookingFiltersSection.hidden = false;
  }

  const filtered = getFilteredBookings(state.bookings);
  renderStats(filtered);
  renderMembership();
  renderServices();

  if (isAdmin) {
    renderAdminRows(filtered);
    renderAdminMembershipOrders();
  } else {
    renderUserRows(filtered);
  }
}

function renderServicePanelContext() {
  if (elements.servicePanelLead) {
    if (state.user?.role === 'admin') {
      elements.servicePanelLead.textContent =
        'Enter customer details, then choose the service and slot. After booking, share the generated payment link.';
    } else {
      elements.servicePanelLead.textContent =
        'Choose a service category and save bookings into My Bookings. Any IV Therapy or IV Shot, including a hydrogen add-on, needs a 2-week gap before the next IV booking. Hydrogen without an add-on can still be booked on other days. Reach out to us if you still want to book sooner. Hydrogen is limited to 3 sessions per day.';
    }
  }

  if (elements.adminCustomerName) elements.adminCustomerName.value = state.adminCustomerForm.name || '';
  if (elements.adminCustomerEmail) elements.adminCustomerEmail.value = state.adminCustomerForm.email || '';
  if (elements.adminCustomerPhone) elements.adminCustomerPhone.value = state.adminCustomerForm.phone || '';

  if (elements.adminClientMeta) {
    const resolvedCustomer = state.adminResolvedCustomer;
    if (state.user?.role !== 'admin' || !isAdminCustomerFormReady()) {
      elements.adminClientMeta.hidden = true;
      elements.adminClientMeta.innerHTML = '';
      if (state.user?.role === 'admin' && !elements.adminCustomerMessage?.textContent) {
        setAdminCustomerMessage('Enter customer name, email, and contact number to load services.');
      }
      return;
    }

    const membershipStatus = String(resolvedCustomer?.membershipStatus || 'inactive');
    const membershipSummary =
      membershipStatus === 'active'
        ? `Active${resolvedCustomer?.membershipPeopleCount ? ` • ${resolvedCustomer.membershipPeopleCount} member${resolvedCustomer.membershipPeopleCount > 1 ? 's' : ''}` : ''}`
        : 'Inactive';
    elements.adminClientMeta.hidden = false;
    elements.adminClientMeta.innerHTML = `
      <div class="admin-client-chip">
        <strong>Customer</strong>
        <span>${escapeHtml(state.adminCustomerForm.name || '-')}</span>
      </div>
      <div class="admin-client-chip">
        <strong>Contact</strong>
        <span>${escapeHtml(state.adminCustomerForm.phone || state.adminCustomerForm.email || '-')}</span>
      </div>
      <div class="admin-client-chip">
        <strong>Membership</strong>
        <span>${escapeHtml(membershipSummary)}</span>
      </div>
      <div class="admin-client-chip">
        <strong>Valid Till</strong>
        <span>${resolvedCustomer?.membershipExpiresAt ? escapeHtml(new Date(resolvedCustomer.membershipExpiresAt).toLocaleDateString()) : '-'}</span>
      </div>
    `;
  }
}

function renderServices() {
  if (!elements.serviceGrid) return;

  elements.serviceGrid.innerHTML = '';
  if (!state.services.length) {
    elements.serviceEmpty.hidden = false;
    elements.serviceEmpty.textContent =
      state.user?.role === 'admin' ? 'No services available for this customer.' : 'No services configured.';
    return;
  }

  elements.serviceEmpty.hidden = true;
  const orderedCategories = ['HYDROGEN SESSION', 'MEMBERSHIP SERVICES', 'IV THERAPIES', 'IV SHOTS'];
  const grouped = new Map();
  for (const category of orderedCategories) grouped.set(category, []);
  for (const service of state.services) {
    const category = String(service.category || '').toUpperCase();
    if (grouped.has(category)) grouped.get(category).push(service);
  }

  const categoryGrid = document.createElement('div');
  categoryGrid.className = 'service-category-grid';
  for (const category of orderedCategories) {
    const categoryServices = grouped.get(category) || [];
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'service-category-card';
    if (state.selectedServiceCategory === category) {
      tile.classList.add('is-active');
    }
    tile.disabled = categoryServices.length === 0;
    tile.innerHTML = `
      <span class="service-category-name">${escapeHtml(category)}</span>
      <span class="service-category-meta">${categoryServices.length} option${categoryServices.length === 1 ? '' : 's'}</span>
    `;
    tile.addEventListener('click', () => {
      state.selectedServiceCategory = category;
      resetHydrogenComposer({ keepCategory: true });
      resetSingleSessionComposer();
      state.selectedServiceCategory = category;
      if (category === 'HYDROGEN SESSION') {
        const firstHydrogenService = (grouped.get('HYDROGEN SESSION') || [])[0];
        state.selectedHydrogenServiceName = firstHydrogenService?.name || '';
      }
      if (!state.selectedServiceDate) state.selectedServiceDate = getTodayIsoDate();
      state.slotAvailability = {};
      state.slotAvailabilityLoading = true;
      renderServices();
      loadServiceAvailability();
    });
    categoryGrid.appendChild(tile);
  }
  elements.serviceGrid.appendChild(categoryGrid);

  if (!state.selectedServiceCategory) {
    return;
  }

  const selectedCategory = state.selectedServiceCategory;
  const selectedServices = grouped.get(selectedCategory) || [];
  const isHydrogenCategory = selectedCategory === 'HYDROGEN SESSION';
  const isSingleSessionCategory =
    selectedCategory === 'IV THERAPIES' ||
    selectedCategory === 'IV SHOTS' ||
    selectedCategory === 'MEMBERSHIP SERVICES';
  const section = document.createElement('section');
  section.className = 'service-section service-cluster';
  section.dataset.serviceCategory = selectedCategory;
  section.innerHTML = `
    <header class="service-cluster-head">
      <div>
        <h3 class="service-section-title">${escapeHtml(selectedCategory)}</h3>
        <p class="service-section-copy">${selectedServices.length} option${selectedServices.length === 1 ? '' : 's'}</p>
      </div>
    </header>
  `;

  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className = 'btn btn-secondary service-back-btn';
  backButton.textContent = 'Back to categories';
  backButton.addEventListener('click', () => {
    resetHydrogenComposer();
    resetSingleSessionComposer();
    state.slotAvailability = {};
    state.slotCapacityByService = {};
    state.slotAvailabilityLoading = false;
    renderServices();
  });
  section.querySelector('.service-cluster-head').appendChild(backButton);

  if (!isHydrogenCategory) {
    resetHydrogenComposer({ keepCategory: true });
  }

  if (isHydrogenCategory) {
    const isEditingHydrogenGroup = Boolean(state.hydrogenEditingGroupId);
    const planOptions = getHydrogenPlanOptions(selectedServices);
    if (!planOptions.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'Hydrogen session plans are not configured.';
      section.appendChild(empty);
      elements.serviceGrid.appendChild(section);
      return;
    }

    if (!state.selectedHydrogenServiceName || !planOptions.some((opt) => opt.service.name === state.selectedHydrogenServiceName)) {
      state.selectedHydrogenServiceName = planOptions[0].service.name;
    }

    const selectedPlan = planOptions.find((opt) => opt.service.name === state.selectedHydrogenServiceName) || planOptions[0];
    const packageSessions = Number(selectedPlan.sessions || 1);
    const extraSessions = Math.max(0, Number(state.selectedHydrogenExtraSessions || 0));
    const requiredSlots = packageSessions + extraSessions;
    if (state.selectedHydrogenSlots.length > requiredSlots) {
      state.selectedHydrogenSlots = state.selectedHydrogenSlots.slice(0, requiredSlots);
    }

    const selectedService = selectedPlan.service;
    const memberPrice = Number(selectedService.memberPriceInr || 0);
    const nonMemberPrice = Number(selectedService.nonMemberPriceInr || 0);
    const singleSession = selectedServices.find((service) => getHydrogenSessionCountFromServiceName(service.name) === 1) || selectedService;
    const extraSessionPrice = Number(singleSession.effectivePriceInr || singleSession.memberPriceInr || singleSession.nonMemberPriceInr || 0);
    const addOnServices = state.services.filter((service) => {
      const category = String(service.category || '').toUpperCase();
      return category === 'IV THERAPIES' || category === 'IV SHOTS';
    });
    if (!addOnServices.some((service) => service.name === state.selectedHydrogenAddOnServiceName)) {
      state.selectedHydrogenAddOnServiceName = '';
    }
    if (!Number.isInteger(state.selectedHydrogenAddOnSessionIndex) || state.selectedHydrogenAddOnSessionIndex < 0) {
      state.selectedHydrogenAddOnSessionIndex = 0;
    }
    if (state.selectedHydrogenAddOnSessionIndex >= requiredSlots) {
      state.selectedHydrogenAddOnSessionIndex = 0;
    }
    const selectedAddOnService = addOnServices.find((service) => service.name === state.selectedHydrogenAddOnServiceName) || null;
    const selectedAddOnPriceInr = Number(selectedAddOnService?.effectivePriceInr || selectedAddOnService?.priceInr || 0);
    const consolidatedAmount = Number(selectedService.effectivePriceInr || 0) + extraSessions * extraSessionPrice + selectedAddOnPriceInr;

    const layout = document.createElement('div');
    layout.className = 'hydrogen-layout';
    layout.dataset.hydrogenEditor = 'true';

    const sidebar = document.createElement('aside');
    sidebar.className = 'hydrogen-sidebar';
    sidebar.innerHTML = `
      <h4 class="hydrogen-sidebar-title">Hydrogen Therapy</h4>
      <div class="hydrogen-plan-controls">
        <label>
          Session Package
          <select class="hydrogen-plan-select"></select>
        </label>
        <label>
          Add Extra Sessions (+n)
          <input class="hydrogen-extra-input" type="number" min="0" step="1" value="${extraSessions}" />
        </label>
      </div>
    `;
    const planSelect = sidebar.querySelector('.hydrogen-plan-select');
    for (const opt of planOptions) {
      const option = document.createElement('option');
      option.value = opt.service.name;
      option.textContent = `${opt.sessions} Sessions`;
      planSelect.appendChild(option);
    }
    planSelect.value = state.selectedHydrogenServiceName;
    planSelect.disabled = isEditingHydrogenGroup;
    planSelect.addEventListener('change', () => {
      state.selectedHydrogenServiceName = planSelect.value;
      state.selectedHydrogenSlots = [];
      state.activeHydrogenSessionIndex = 0;
      state.activeHydrogenSessionDate = '';
      state.activeHydrogenSessionTime = '';
      renderServices();
    });
    const extraInput = sidebar.querySelector('.hydrogen-extra-input');
    extraInput.disabled = isEditingHydrogenGroup;
    extraInput.addEventListener('input', () => {
      const parsed = Math.max(0, Number(extraInput.value || 0));
      state.selectedHydrogenExtraSessions = Number.isFinite(parsed) ? Math.floor(parsed) : 0;
      state.selectedHydrogenSlots = [];
      state.selectedHydrogenAddOnSessionIndex = 0;
      state.activeHydrogenSessionIndex = 0;
      state.activeHydrogenSessionDate = '';
      state.activeHydrogenSessionTime = '';
      renderServices();
    });
    const addOnSelect = document.createElement('select');
    addOnSelect.className = 'hydrogen-addon-select';
    const noAddOnOption = document.createElement('option');
    noAddOnOption.value = '';
    noAddOnOption.textContent = 'No add-on';
    addOnSelect.appendChild(noAddOnOption);
    for (const addOn of addOnServices) {
      const option = document.createElement('option');
      option.value = addOn.name;
      option.textContent = `${addOn.name} - Rs. ${Number(addOn.effectivePriceInr || addOn.priceInr || 0).toLocaleString('en-IN')}`;
      addOnSelect.appendChild(option);
    }
    addOnSelect.value = state.selectedHydrogenAddOnServiceName;
    addOnSelect.addEventListener('change', () => {
      state.selectedHydrogenAddOnServiceName = addOnSelect.value;
      renderServices();
    });
    const addOnSessionSelect = document.createElement('select');
    addOnSessionSelect.className = 'hydrogen-addon-session-select';
    for (let idx = 0; idx < requiredSlots; idx += 1) {
      const option = document.createElement('option');
      option.value = String(idx);
      option.textContent = `Session ${idx + 1}`;
      addOnSessionSelect.appendChild(option);
    }
    addOnSessionSelect.value = String(state.selectedHydrogenAddOnSessionIndex || 0);
    addOnSessionSelect.disabled = !state.selectedHydrogenAddOnServiceName;
    addOnSessionSelect.addEventListener('change', () => {
      state.selectedHydrogenAddOnSessionIndex = Math.max(0, Number(addOnSessionSelect.value || 0));
    });

    const sessionsList = document.createElement('div');
    sessionsList.className = 'hydrogen-session-list';
    if (state.activeHydrogenSessionIndex >= requiredSlots) {
      state.activeHydrogenSessionIndex = 0;
    }
    for (let idx = 0; idx < requiredSlots; idx += 1) {
      const sessionBtn = document.createElement('button');
      sessionBtn.type = 'button';
      const assigned = Boolean(state.selectedHydrogenSlots[idx]);
      sessionBtn.className = `hydrogen-session-item${idx === state.activeHydrogenSessionIndex ? ' is-active' : ''}${
        assigned ? ' is-assigned' : ''
      }`;
      sessionBtn.textContent = `Session ${idx + 1}${assigned ? ' ✓' : ''}`;
      sessionBtn.addEventListener('click', () => {
        state.activeHydrogenSessionIndex = idx;
        state.activeHydrogenSessionDate = state.selectedHydrogenSlots[idx]?.bookingDate || getTodayIsoDate();
        state.activeHydrogenSessionTime = state.selectedHydrogenSlots[idx]?.bookingTime || SLOT_OPTIONS[0].value;
        refreshSelectedCategoryAvailability(state.activeHydrogenSessionDate);
      });
      sessionsList.appendChild(sessionBtn);
    }
    sidebar.appendChild(sessionsList);
    layout.appendChild(sidebar);

    const main = document.createElement('div');
    main.className = 'hydrogen-main';
    const assignedCount = state.selectedHydrogenSlots.slice(0, requiredSlots).filter(Boolean).length;
    const activeSlot = state.selectedHydrogenSlots[state.activeHydrogenSessionIndex] || null;
    const editorDate = state.activeHydrogenSessionDate || activeSlot?.bookingDate || getTodayIsoDate();
    const editorTime = state.activeHydrogenSessionTime || activeSlot?.bookingTime || SLOT_OPTIONS[0].value;
    state.activeHydrogenSessionDate = editorDate;
    state.activeHydrogenSessionTime = editorTime;
    if (state.selectedServiceDate !== editorDate) {
      state.selectedServiceDate = editorDate;
    }

    const card = document.createElement('article');
    card.className = 'doctor-card service-card';
    card.innerHTML = `
      <div class="service-card-head">
        <h3>${escapeHtml(selectedService.name)}</h3>
        <p class="service-card-subline">${isEditingHydrogenGroup ? 'Edit the full saved package and update all sessions' : 'Configure sessions and save booking'}</p>
      </div>
      <div class="service-price-panel">
        <p class="service-price-line">
          <span class="price-label">Consolidated Price</span>
          <strong>Rs. ${consolidatedAmount.toLocaleString('en-IN')}</strong>
        </p>
        <p class="service-price-meta">Package: Rs. ${Number(selectedService.effectivePriceInr || 0).toLocaleString(
          'en-IN'
        )} | Extra/session: Rs. ${extraSessionPrice.toLocaleString('en-IN')}</p>
        <p class="service-price-meta">Membership payment is separate. This total is only for the session booking${
          selectedAddOnService ? ' and optional IV add-on' : ''
        }.</p>
        ${isEditingHydrogenGroup ? '<p class="service-price-meta">Package size is locked during edit. Update session dates, times, and the optional add-on here.</p>' : ''}
        <div class="hydrogen-pricing-grid">
          <span class="hydrogen-pricing-head">No. of Services</span>
          <span class="hydrogen-pricing-head">Non Member</span>
          <span class="hydrogen-pricing-head">Member</span>
          <span>${escapeHtml(formatSessionLabel(packageSessions))}</span>
          <span>Rs. ${nonMemberPrice.toLocaleString('en-IN')}</span>
          <span>Rs. ${memberPrice.toLocaleString('en-IN')}</span>
        </div>
      </div>
    `;

    const addOnPanel = document.createElement('div');
    addOnPanel.className = 'hydrogen-addon-panel';
    addOnPanel.innerHTML = `
      <div class="hydrogen-addon-head">
        <strong>Optional IV Add-on</strong>
        <span>Choose 1 IV Therapy or IV Shot with this hydrogen booking.</span>
      </div>
      <div class="hydrogen-addon-grid">
        <label>
          Add-on Service
        </label>
        <label>
          Add-on Session
        </label>
      </div>
    `;
    const addOnGrid = addOnPanel.querySelector('.hydrogen-addon-grid');
    addOnGrid.children[0].appendChild(addOnSelect);
    addOnGrid.children[1].appendChild(addOnSessionSelect);
    const addOnNote = document.createElement('p');
    addOnNote.className = 'hydrogen-addon-note';
    addOnNote.textContent =
      'Only 1 add-on can be booked in the same time slot. If more are needed, admin will add them after consultation.';
    addOnPanel.appendChild(addOnNote);
    card.appendChild(addOnPanel);

    const editor = document.createElement('div');
    editor.className = 'hydrogen-session-editor';
    editor.innerHTML = `
      <h4>Session ${state.activeHydrogenSessionIndex + 1}</h4>
      <div class="hydrogen-editor-grid">
        <label>
          Date
          <input class="hydrogen-editor-date" type="date" min="${getTodayIsoDate()}" max="${getMaxBookingIsoDate()}" value="${editorDate}" />
        </label>
        <label>
          Time
          <select class="hydrogen-editor-time"></select>
        </label>
      </div>
    `;
    const timeSelect = editor.querySelector('.hydrogen-editor-time');
    populateAvailableTimeOptions(timeSelect, selectedService.name, editorDate, activeSlot);
    state.activeHydrogenSessionTime = timeSelect.value || SLOT_OPTIONS[0].value;
    const dateInput = editor.querySelector('.hydrogen-editor-date');
    dateInput.addEventListener('change', () => {
      state.activeHydrogenSessionDate = dateInput.value || getTodayIsoDate();
      refreshSelectedCategoryAvailability(state.activeHydrogenSessionDate);
    });
    timeSelect.addEventListener('change', () => {
      state.activeHydrogenSessionTime = timeSelect.value || SLOT_OPTIONS[0].value;
    });

    const editorActions = document.createElement('div');
    editorActions.className = 'hydrogen-editor-actions';
    const saveSessionBtn = document.createElement('button');
    saveSessionBtn.type = 'button';
    saveSessionBtn.className = 'btn btn-secondary';
    saveSessionBtn.textContent = 'Set Session Date & Time';
    saveSessionBtn.addEventListener('click', () => {
      state.selectedHydrogenSlots[state.activeHydrogenSessionIndex] = {
        bookingDate: state.activeHydrogenSessionDate || getTodayIsoDate(),
        bookingTime: state.activeHydrogenSessionTime || SLOT_OPTIONS[0].value,
      };
      renderServices();
    });
    const clearSessionBtn = document.createElement('button');
    clearSessionBtn.type = 'button';
    clearSessionBtn.className = 'btn btn-secondary';
    clearSessionBtn.textContent = 'Clear Session';
    clearSessionBtn.addEventListener('click', () => {
      state.selectedHydrogenSlots[state.activeHydrogenSessionIndex] = undefined;
      renderServices();
    });
    editorActions.appendChild(saveSessionBtn);
    editorActions.appendChild(clearSessionBtn);
    editor.appendChild(editorActions);
    card.appendChild(editor);

    const selectedSummary = document.createElement('div');
    selectedSummary.className = 'hydrogen-selected-list';
    for (let idx = 0; idx < requiredSlots; idx += 1) {
      const slot = state.selectedHydrogenSlots[idx];
      const summaryItem = document.createElement('span');
      summaryItem.className = 'hydrogen-selected-item';
      summaryItem.textContent = slot ? `S${idx + 1}: ${slot.bookingDate} ${slot.bookingTime}` : `S${idx + 1}: Pending`;
      selectedSummary.appendChild(summaryItem);
    }
    if (selectedAddOnService) {
      const addOnSummary = document.createElement('span');
      addOnSummary.className = 'hydrogen-selected-item';
      addOnSummary.textContent = `IV Add-on: ${selectedAddOnService.name} (Session ${state.selectedHydrogenAddOnSessionIndex + 1})`;
      selectedSummary.appendChild(addOnSummary);
    }
    card.appendChild(selectedSummary);

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'btn btn-primary';
    saveBtn.textContent = assignedCount === requiredSlots ? (isEditingHydrogenGroup ? 'Update Package' : 'Book Now') : `Set ${requiredSlots - assignedCount} more session(s)`;
    saveBtn.disabled = assignedCount !== requiredSlots || requiredSlots <= 0;
    saveBtn.addEventListener('click', async () => {
      try {
        const submitSlots = getHydrogenSlotsForSubmit(requiredSlots);
        if (selectedAddOnService) {
          const addOnSlot = submitSlots[state.selectedHydrogenAddOnSessionIndex];
          if (addOnSlot && hasStandaloneIvOnDateClient(addOnSlot.bookingDate, state.hydrogenEditingGroupId)) {
            alert(
              'A separate IV Therapy/IV Shot is already booked on this date. Hydrogen packages with an IV add-on cannot be combined with separate IV bookings on the same day.'
            );
            return;
          }
        }
        if (isEditingHydrogenGroup) {
          await updateHydrogenPackBookings({
            bookingGroupId: state.hydrogenEditingGroupId,
            serviceName: selectedService.name,
            extraSessions,
            slots: submitSlots,
            addOnServiceName: selectedAddOnService?.name || '',
            addOnSessionIndex: selectedAddOnService ? state.selectedHydrogenAddOnSessionIndex : null,
          });
        } else {
          await saveHydrogenPackBookings({
            serviceName: selectedService.name,
            extraSessions,
            slots: submitSlots,
            addOnServiceName: selectedAddOnService?.name || '',
            addOnSessionIndex: selectedAddOnService ? state.selectedHydrogenAddOnSessionIndex : null,
          });
        }
      } catch (error) {
        alert(error.message || `Unable to ${isEditingHydrogenGroup ? 'update' : 'save'} hydrogen booking.`);
      }
    });
    if (isEditingHydrogenGroup) {
      const cancelEditBtn = document.createElement('button');
      cancelEditBtn.type = 'button';
      cancelEditBtn.className = 'btn btn-secondary';
      cancelEditBtn.textContent = 'Cancel Package Edit';
      cancelEditBtn.addEventListener('click', () => {
        resetHydrogenComposer();
        render();
      });
      card.appendChild(cancelEditBtn);
    }
    card.appendChild(saveBtn);
    main.appendChild(card);
    layout.appendChild(main);
    section.appendChild(layout);
    elements.serviceGrid.appendChild(section);
    return;
  }

  if (isSingleSessionCategory) {
    if (
      !state.selectedSingleSessionServiceName ||
      !selectedServices.some((service) => service.name === state.selectedSingleSessionServiceName)
    ) {
      state.selectedSingleSessionServiceName = selectedServices[0]?.name || '';
    }

    const selectedService =
      selectedServices.find((service) => service.name === state.selectedSingleSessionServiceName) || selectedServices[0];
    if (!selectedService) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'No services are configured in this category.';
      section.appendChild(empty);
      elements.serviceGrid.appendChild(section);
      return;
    }

    const effectivePrice = Number(selectedService.effectivePriceInr ?? selectedService.priceInr ?? 0);
    const isMembershipOnly = Boolean(selectedService.membershipOnly);
    const selection = state.ivSelections[selectedService.name] || {};
    const activeSingleSessionEditId = String(state.singleSessionEditingBookingId || '').trim();
    const isEditingSingleSession =
      Boolean(activeSingleSessionEditId) && String(selection.editingBookingId || '').trim() === activeSingleSessionEditId;
    const editorDate = selection.editingDate || selection.bookingDate || getTodayIsoDate();
    const editorTime = selection.editingTime || selection.bookingTime || SLOT_OPTIONS[0].value;
    if (state.selectedServiceDate !== editorDate) {
      state.selectedServiceDate = editorDate;
    }

    const layout = document.createElement('div');
    layout.className = 'hydrogen-layout';

    const sidebar = document.createElement('aside');
    sidebar.className = 'hydrogen-sidebar';
    sidebar.innerHTML = `
      <h4 class="hydrogen-sidebar-title">${escapeHtml(selectedCategory)}</h4>
      <div class="hydrogen-plan-controls">
        <label>
          Choose Service
          <select class="hydrogen-plan-select single-session-service-select"></select>
        </label>
      </div>
    `;
    const serviceSelect = sidebar.querySelector('.single-session-service-select');
    for (const service of selectedServices) {
      const option = document.createElement('option');
      option.value = service.name;
      option.textContent = service.name;
      serviceSelect.appendChild(option);
    }
    serviceSelect.value = selectedService.name;
    serviceSelect.disabled = isEditingSingleSession;
    serviceSelect.addEventListener('change', () => {
      state.selectedSingleSessionServiceName = serviceSelect.value;
      const nextSelection = state.ivSelections[serviceSelect.value] || {};
      state.singleSessionEditingBookingId = String(nextSelection.editingBookingId || '');
      state.selectedServiceDate = nextSelection.editingDate || nextSelection.bookingDate || getTodayIsoDate();
      state.slotAvailability = {};
      state.slotCapacityByService = {};
      state.slotAvailabilityLoading = true;
      render();
      loadServiceAvailability();
    });

    const sessionsList = document.createElement('div');
    sessionsList.className = 'hydrogen-session-list';
    const sessionBtn = document.createElement('button');
    sessionBtn.type = 'button';
    sessionBtn.className = `hydrogen-session-item is-active${selection.bookingDate && selection.bookingTime ? ' is-assigned' : ''}`;
    sessionBtn.textContent = `Session 1${selection.bookingDate && selection.bookingTime ? ' ✓' : ''}`;
    sessionsList.appendChild(sessionBtn);
    sidebar.appendChild(sessionsList);
    layout.appendChild(sidebar);

    const main = document.createElement('div');
    main.className = 'hydrogen-main';
    const card = document.createElement('article');
    card.className = 'doctor-card service-card';
    card.innerHTML = `
      <div class="service-card-head">
        <h3>${escapeHtml(selectedService.name)}</h3>
        <p class="service-card-subline">${
          isEditingSingleSession ? 'Update the booked session date and time' : 'Configure one session and save booking'
        }</p>
      </div>
      <div class="service-price-panel">
        <p class="service-price-line">
          <span class="price-label">Your Price</span>
          <strong>${isMembershipOnly ? 'Included in Membership' : `Rs. ${effectivePrice.toLocaleString('en-IN')}`}</strong>
        </p>
      </div>
    `;

    const editor = document.createElement('div');
    editor.className = 'hydrogen-session-editor';
    editor.innerHTML = `
      <h4>Session 1</h4>
      <div class="hydrogen-editor-grid">
        <label>
          Date
          <input class="hydrogen-editor-date" type="date" min="${getTodayIsoDate()}" max="${getMaxBookingIsoDate()}" value="${editorDate}" />
        </label>
        <label>
          Time
          <select class="hydrogen-editor-time"></select>
        </label>
      </div>
    `;
    const ivDateInput = editor.querySelector('.hydrogen-editor-date');
    const ivTimeSelect = editor.querySelector('.hydrogen-editor-time');
    populateAvailableTimeOptions(ivTimeSelect, selectedService.name, editorDate, {
      bookingDate: selection.bookingDate || '',
      bookingTime: selection.bookingTime || '',
    });
    state.ivSelections[selectedService.name] = {
      ...(state.ivSelections[selectedService.name] || {}),
      editingTime: ivTimeSelect.value || editorTime || SLOT_OPTIONS[0].value,
    };
    ivDateInput.addEventListener('change', () => {
      state.ivSelections[selectedService.name] = {
        ...(state.ivSelections[selectedService.name] || {}),
        editingDate: ivDateInput.value || getTodayIsoDate(),
      };
      refreshSelectedCategoryAvailability(ivDateInput.value || getTodayIsoDate());
    });
    ivTimeSelect.addEventListener('change', () => {
      state.ivSelections[selectedService.name] = {
        ...(state.ivSelections[selectedService.name] || {}),
        editingTime: ivTimeSelect.value || SLOT_OPTIONS[0].value,
      };
    });

    const editorActions = document.createElement('div');
    editorActions.className = 'hydrogen-editor-actions';
    const setSessionBtn = document.createElement('button');
    setSessionBtn.type = 'button';
    setSessionBtn.className = 'btn btn-secondary';
    setSessionBtn.textContent = 'Set Session Date & Time';
    setSessionBtn.addEventListener('click', () => {
      state.ivSelections[selectedService.name] = {
        editingDate: ivDateInput.value || getTodayIsoDate(),
        editingTime: ivTimeSelect.value || SLOT_OPTIONS[0].value,
        bookingDate: ivDateInput.value || getTodayIsoDate(),
        bookingTime: ivTimeSelect.value || SLOT_OPTIONS[0].value,
      };
      renderServices();
    });
    const clearSessionBtn = document.createElement('button');
    clearSessionBtn.type = 'button';
    clearSessionBtn.className = 'btn btn-secondary';
    clearSessionBtn.textContent = 'Clear Session';
    clearSessionBtn.addEventListener('click', () => {
      state.ivSelections[selectedService.name] = {
        editingDate: ivDateInput.value || getTodayIsoDate(),
        editingTime: ivTimeSelect.value || SLOT_OPTIONS[0].value,
        bookingDate: '',
        bookingTime: '',
      };
      renderServices();
    });
    editorActions.appendChild(setSessionBtn);
    editorActions.appendChild(clearSessionBtn);
    editor.appendChild(editorActions);
    card.appendChild(editor);

    const selectedSummary = document.createElement('div');
    selectedSummary.className = 'hydrogen-selected-list';
    const summaryItem = document.createElement('span');
    summaryItem.className = 'hydrogen-selected-item';
    summaryItem.textContent =
      selection.bookingDate && selection.bookingTime
        ? `Session: ${formatDateTime(selection.bookingDate, selection.bookingTime)}`
        : 'Session: Pending';
    selectedSummary.appendChild(summaryItem);
    card.appendChild(selectedSummary);

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'btn btn-primary';
    saveBtn.textContent = selection.bookingDate && selection.bookingTime ? (isEditingSingleSession ? 'Update Booking' : 'Book Now') : 'Set Session Date & Time';
    saveBtn.disabled = !(selection.bookingDate && selection.bookingTime);
    saveBtn.addEventListener('click', async () => {
      try {
        await saveSingleSessionServiceBooking(selectedService.name);
      } catch (error) {
        alert(error.message || 'Unable to save booking.');
      }
    });
    card.appendChild(saveBtn);
    if (isEditingSingleSession) {
      const cancelEditBtn = document.createElement('button');
      cancelEditBtn.type = 'button';
      cancelEditBtn.className = 'btn btn-secondary';
      cancelEditBtn.textContent = 'Cancel Edit';
      cancelEditBtn.addEventListener('click', () => {
        resetSingleSessionComposer();
        render();
      });
      card.appendChild(cancelEditBtn);
    }
    main.appendChild(card);
    layout.appendChild(main);
    section.appendChild(layout);
    elements.serviceGrid.appendChild(section);
    return;
  }

  if (!isSingleSessionCategory) {
    const dateRow = document.createElement('div');
    dateRow.className = 'service-date-row';
    const dateLabel = document.createElement('label');
    dateLabel.textContent = 'Select Date';
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.value = state.selectedServiceDate || getTodayIsoDate();
    dateInput.min = getTodayIsoDate();
    dateInput.max = getMaxBookingIsoDate();
    dateInput.className = 'service-date-input';
    dateInput.addEventListener('change', () => {
      state.selectedServiceDate = dateInput.value || getTodayIsoDate();
      state.slotAvailability = {};
      state.slotAvailabilityLoading = true;
      renderServices();
      loadServiceAvailability();
    });
    dateLabel.appendChild(dateInput);
    dateRow.appendChild(dateLabel);
    section.appendChild(dateRow);
  }

  const grid = document.createElement('div');
  grid.className = 'service-card-grid';
  for (const service of selectedServices) {
    const card = document.createElement('article');
    card.className = 'doctor-card service-card';
    const effectivePrice = Number(service.effectivePriceInr ?? service.priceInr ?? 0);
    const isMembershipOnly = Boolean(service.membershipOnly);
    const hasDualHydrogenPrices =
      String(service.category || '').toUpperCase() === 'HYDROGEN SESSION' &&
      Number(service.memberPriceInr) > 0 &&
      Number(service.nonMemberPriceInr) > 0;
    const memberPriceText = Number(service.memberPriceInr).toLocaleString('en-IN');
    const nonMemberPriceText = Number(service.nonMemberPriceInr).toLocaleString('en-IN');

    card.innerHTML = `
      <div class="service-card-head">
        <h3>${escapeHtml(service.name)}</h3>
        <p class="service-card-subline">${isSingleSessionCategory ? 'Set one session date and time below' : isHydrogenCategory ? 'Select date and slot below' : 'Select this plan to continue'}</p>
      </div>
      <div class="service-price-panel">
        <p class="service-price-line">
          <span class="price-label">Your Price</span>
          <strong>${isMembershipOnly ? 'Included in Membership' : `Rs. ${effectivePrice.toLocaleString('en-IN')}`}</strong>
        </p>
        ${
          hasDualHydrogenPrices
            ? `<p class="service-price-meta">Member: Rs. ${memberPriceText} | Non-member: Rs. ${nonMemberPriceText}</p>
               <div class="hydrogen-pricing-grid">
                 <span class="hydrogen-pricing-head">No. of Services</span>
                 <span class="hydrogen-pricing-head">Non Member</span>
                 <span class="hydrogen-pricing-head">Member</span>
                 <span>${escapeHtml(service.name)}</span>
                 <span>Rs. ${nonMemberPriceText}</span>
                 <span>Rs. ${memberPriceText}</span>
               </div>`
            : ''
        }
      </div>
    `;

    const slotsWrap = document.createElement('div');
    slotsWrap.className = 'service-slots-wrap';
    const slotsTitle = document.createElement('p');
    slotsTitle.className = 'service-slots-title';
    slotsTitle.textContent = state.slotAvailabilityLoading ? 'Loading slots...' : 'Available time slots';
    slotsWrap.appendChild(slotsTitle);

    const slotGrid = document.createElement('div');
    slotGrid.className = 'service-slot-grid';
    const serviceAvailability = state.slotAvailability[service.name] || {};
    for (const slot of SLOT_OPTIONS) {
      const booked = Number(serviceAvailability[slot.value] || 0);
      const capacity = Number(state.slotCapacityByService[service.name] || 8);
      const slotRow = document.createElement('div');
      slotRow.className = 'service-slot-row';
      const slotTime = document.createElement('span');
      slotTime.className = 'slot-time';
      slotTime.textContent = slot.label;
      const seatWrap = document.createElement('div');
      seatWrap.className = 'slot-seat-grid';
      for (let seatIndex = 0; seatIndex < capacity; seatIndex += 1) {
        const seatBooked = seatIndex < booked;
        const seatBtn = document.createElement('button');
        seatBtn.type = 'button';
        seatBtn.className = `slot-seat-box${seatBooked ? ' is-booked' : ' is-available'}`;
        seatBtn.disabled = seatBooked || state.slotAvailabilityLoading;
        seatBtn.title = seatBooked ? 'Booked' : `Book ${slot.label}`;
        seatBtn.setAttribute('aria-label', `${slot.label} seat ${seatIndex + 1} ${seatBooked ? 'booked' : 'available'}`);
        seatBtn.addEventListener('click', () => {
          openDialog();
          elements.serviceName.value = service.name;
          if (state.selectedServiceDate) {
            elements.bookingDate.value = state.selectedServiceDate;
          }
          elements.bookingTime.value = slot.value;
        });
        seatWrap.appendChild(seatBtn);
      }
      const slotMeta = document.createElement('span');
      slotMeta.className = 'slot-meta';
      slotMeta.textContent = `${booked}/${capacity}`;
      slotRow.appendChild(slotTime);
      slotRow.appendChild(seatWrap);
      slotRow.appendChild(slotMeta);
      slotGrid.appendChild(slotRow);
    }
    slotsWrap.appendChild(slotGrid);
    card.appendChild(slotsWrap);
    grid.appendChild(card);
  }

  section.appendChild(grid);
  elements.serviceGrid.appendChild(section);
}

function getHydrogenSessionCountFromServiceName(serviceName) {
  const raw = String(serviceName || '').trim();
  const normalized = raw.toLowerCase();
  if (normalized.includes('single')) return 1;

  // Prefer explicit session count mentions like "(4 Sessions)".
  let match = raw.match(/\((\d+)\s*session/i);
  if (match) return Number(match[1]);

  match = raw.match(/\b(\d+)\s*session/i);
  if (match) return Number(match[1]);

  // Fallback: ignore "H2" prefix and use first standalone number.
  const cleaned = normalized.replace(/\bh2\b/g, ' ');
  match = cleaned.match(/\b(\d+)\b/);
  return match ? Number(match[1]) : 1;
}

function getHydrogenPlanOptions(services) {
  const preferredOrder = [1, 4, 8, 16, 30, 90];
  const bySessions = new Map();
  for (const service of services) {
    bySessions.set(getHydrogenSessionCountFromServiceName(service.name), service);
  }
  const options = [];
  for (const sessions of preferredOrder) {
    const service = bySessions.get(sessions);
    if (service) options.push({ sessions, service });
  }
  return options;
}

function formatSessionLabel(sessions) {
  if (sessions === 1) return '1 Session';
  return `${sessions} Sessions`;
}

function getTodayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMaxBookingIsoDate() {
  const now = new Date();
  now.setDate(now.getDate() + BOOKING_WINDOW_DAYS);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function renderMembership() {
  if (!elements.membershipPlans || !elements.membershipStatusText) return;
  if (state.user?.role !== 'user') return;

  if (elements.memberFlowLabel) {
    elements.memberFlowLabel.textContent =
      state.postLoginChoice === 'member'
        ? 'Member mode selected'
        : state.postLoginChoice === 'non-member'
          ? 'Membership is available if you want to switch later by signing in again.'
          : '';
  }

  const current = state.membership.current || {};
  const active = Boolean(state.membership.active);
  const currentPeopleCount = Number(current.peopleCount || 0);
  const activePlan =
    (state.membership.plans || []).find((plan) => String(plan.id) === String(current.plan || '')) ||
    null;
  const activePlanName = activePlan?.name || current.plan || 'Membership';
  elements.membershipStatusText.textContent = active
    ? `Active plan: ${activePlanName}${currentPeopleCount > 0 ? ` • ${currentPeopleCount} member${currentPeopleCount > 1 ? 's' : ''}` : ''}${
        current.expiresAt ? ` (valid till ${new Date(current.expiresAt).toLocaleDateString()})` : ''
      }`
    : 'No active membership';

  const orderedPlanIds = ['h2_single', 'h2_two', 'h2_four'];
  const plans = orderedPlanIds
    .map((id) => (state.membership.plans || []).find((plan) => String(plan.id) === id))
    .filter(Boolean);
  const addPersonPriceInr = getMembershipAddPersonPriceInr();

  if (!plans.length) {
    elements.membershipPlans.innerHTML = '<p class="empty-state">Membership plans are not configured.</p>';
    return;
  }

  elements.membershipPlans.innerHTML = '';
  for (const plan of plans) {
    const additionalPeople = Math.max(0, Number(state.membershipAdditions?.[plan.id] || 0));
    const targetPeopleCount = Number(plan.peopleCount || 1) + additionalPeople;
    const estimatedAmountInr = Number(plan.priceInr || 0) + additionalPeople * addPersonPriceInr;
    const isCurrentBasePlan = active && String(current.plan || '') === String(plan.id);

    const card = document.createElement('article');
    card.className = 'membership-card';
    card.innerHTML = `
      <h3>${escapeHtml(plan.name)}</h3>
      <p class="membership-price">Rs. ${estimatedAmountInr.toLocaleString('en-IN')}</p>
      <p>${escapeHtml(plan.peopleCount)} member${Number(plan.peopleCount) > 1 ? 's' : ''} • ${escapeHtml(
      plan.validityDays
    )} days • Selected: ${targetPeopleCount}</p>
      <p>${escapeHtml(plan.perks || '')}</p>
    `;

    const addControls = document.createElement('div');
    addControls.className = 'membership-add-controls';
    addControls.innerHTML = `
      <span class="membership-add-label">Add Person: +${additionalPeople}</span>
    `;
    const decBtn = document.createElement('button');
    decBtn.type = 'button';
    decBtn.className = 'btn btn-secondary';
    decBtn.textContent = '-';
    decBtn.disabled = additionalPeople <= 0;
    decBtn.addEventListener('click', () => {
      state.membershipAdditions[plan.id] = Math.max(0, additionalPeople - 1);
      renderMembership();
    });
    const incBtn = document.createElement('button');
    incBtn.type = 'button';
    incBtn.className = 'btn btn-secondary';
    incBtn.textContent = '+ Add Person';
    incBtn.addEventListener('click', () => {
      state.membershipAdditions[plan.id] = Math.min(8, additionalPeople + 1);
      renderMembership();
    });
    addControls.appendChild(decBtn);
    addControls.appendChild(incBtn);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-primary';
    button.textContent = isCurrentBasePlan && additionalPeople === 0 ? 'Active' : 'Continue to Details';
    button.disabled = isCurrentBasePlan && additionalPeople === 0;
    button.addEventListener('click', () => {
      openMembershipCheckoutDialog(plan, additionalPeople);
    });

    card.appendChild(addControls);
    card.appendChild(button);
    elements.membershipPlans.appendChild(card);
  }
}

function getMembershipAddPersonPriceInr() {
  const addPersonPlan = (state.membership.plans || []).find((plan) => String(plan.id) === 'h2_add_person');
  return Number(addPersonPlan?.priceInr || 0);
}

function openMembershipCheckoutDialog(plan, additionalPeople) {
  if (!elements.membershipDialog || !elements.membershipMembersGrid) return;
  const targetPeopleCount = Number(plan.peopleCount || 1) + Number(additionalPeople || 0);
  const addPersonPriceInr = getMembershipAddPersonPriceInr();
  const estimatedAmountInr = Number(plan.priceInr || 0) + Number(additionalPeople || 0) * addPersonPriceInr;
  const members = [];
  for (let i = 0; i < targetPeopleCount; i += 1) {
    members.push({
      name: i === 0 ? state.user?.name || '' : '',
      place: '',
      email: i === 0 ? state.user?.email || '' : '',
      contactNumber: i === 0 ? state.user?.mobile || '' : '',
    });
  }

  state.membershipCheckout = {
    planId: plan.id,
    planName: plan.name,
    additionalPeople: Number(additionalPeople || 0),
    targetPeopleCount,
    estimatedAmountInr,
    members,
  };

  if (elements.membershipDialogTitle) {
    elements.membershipDialogTitle.textContent = `Membership Details • ${plan.name}`;
  }
  if (elements.membershipPlanSummary) {
    elements.membershipPlanSummary.textContent = `Members: ${targetPeopleCount} • Estimated Amount: Rs. ${estimatedAmountInr.toLocaleString(
      'en-IN'
    )}`;
  }

  elements.membershipMembersGrid.innerHTML = '';
  for (let i = 0; i < members.length; i += 1) {
    const member = members[i];
    const row = document.createElement('div');
    row.className = 'membership-member-row';
    row.innerHTML = `
      <h4>Person ${i + 1}</h4>
      <div class="form-grid">
        <label>
          Full Name
          <input type="text" required data-member-index="${i}" data-member-field="name" value="${escapeHtml(member.name)}" />
        </label>
        <label>
          Place
          <input type="text" required data-member-index="${i}" data-member-field="place" value="${escapeHtml(member.place)}" />
        </label>
        <label>
          Email
          <input type="email" required data-member-index="${i}" data-member-field="email" value="${escapeHtml(member.email)}" />
        </label>
        <label>
          Contact Number
          <input type="tel" required data-member-index="${i}" data-member-field="contactNumber" value="${escapeHtml(member.contactNumber)}" />
        </label>
      </div>
    `;
    elements.membershipMembersGrid.appendChild(row);
  }

  elements.membershipDialog.showModal();
}

function closeMembershipDialog() {
  if (elements.membershipDialog?.open) {
    elements.membershipDialog.close();
  }
  state.membershipCheckout = null;
}

function collectMembershipMemberDetails() {
  if (!state.membershipCheckout || !elements.membershipMembersGrid) return [];
  const members = [];
  for (let i = 0; i < state.membershipCheckout.targetPeopleCount; i += 1) {
    const getValue = (field) => {
      const input = elements.membershipMembersGrid.querySelector(
        `[data-member-index="${i}"][data-member-field="${field}"]`
      );
      return String(input?.value || '').trim();
    };
    members.push({
      name: getValue('name'),
      place: getValue('place'),
      email: getValue('email'),
      contactNumber: getValue('contactNumber'),
    });
  }
  return members;
}

async function submitMembershipCheckout() {
  if (!state.membershipCheckout) return;
  const plan = (state.membership.plans || []).find((item) => String(item.id) === String(state.membershipCheckout.planId));
  if (!plan) {
    alert('Membership plan not found.');
    return;
  }

  const memberDetails = collectMembershipMemberDetails();
  try {
    await activateMembershipWithPayment(plan, state.membershipCheckout.additionalPeople, memberDetails);
  } catch (error) {
    alert(error.message || 'Unable to continue with membership payment.');
  }
}

async function activateMembershipWithPayment(plan, additionalPeople = 0, memberDetails = []) {
  const order = await api('/api/membership/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId: plan.id, additionalPeople, memberDetails }),
  });

  if (!window.Razorpay) {
    throw new Error('Razorpay SDK not loaded');
  }

  closeMembershipDialog();

  const options = {
    key: order.keyId,
    amount: order.amount,
    currency: order.currency || 'INR',
    name: 'H2 House Of Health',
    description: `Membership: ${order.plan?.name || plan.name}`,
    order_id: order.orderId,
    prefill: {
      name: order.user?.name || state.user?.name || '',
      email: order.user?.email || state.user?.email || '',
    },
    theme: {
      color: '#8b5e3c',
    },
    handler: async (response) => {
      try {
        const result = await api('/api/membership/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId: plan.id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });
        state.user = { ...state.user, ...(result.profile || {}) };
        await loadDashboardData();
        state.activeUserTab = 'services';
        render();
        requestAnimationFrame(() => {
          elements.servicesSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        alert(result.message || 'Membership activated. Redirecting to Services.');
      } catch (error) {
        alert(error.message || 'Membership payment verification failed.');
      }
    },
    modal: {
      ondismiss: () => {
        alert('Membership payment was canceled.');
      },
    },
  };

  const checkout = new window.Razorpay(options);
  checkout.open();
}

function renderProfileAvatar() {
  const initials = getInitials(state.user?.name || 'User');
  const avatarUrl = normalizeAvatarUrl(state.user?.avatarUrl || '');
  elements.profileAvatar.textContent = initials;
  if (avatarUrl) {
    elements.profileAvatar.style.backgroundImage = `url("${avatarUrl}")`;
    elements.profileAvatar.classList.add('has-image');
  } else {
    elements.profileAvatar.style.backgroundImage = '';
    elements.profileAvatar.classList.remove('has-image');
  }
}

function normalizeAvatarUrl(urlValue) {
  const raw = String(urlValue || '').trim();
  if (!raw) return '';
  if (raw.startsWith('blob:')) return raw;
  try {
    return new URL(raw, window.location.origin).toString();
  } catch {
    return '';
  }
}

function withCacheBuster(urlValue) {
  const normalized = normalizeAvatarUrl(urlValue);
  if (!normalized) return '';
  try {
    const u = new URL(normalized);
    u.searchParams.set('v', String(Date.now()));
    return u.toString();
  } catch {
    return normalized;
  }
}

function getInitials(name) {
  const parts = String(name).trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return 'U';
  return parts.map((part) => part[0].toUpperCase()).join('');
}

function renderStats(bookings) {
  if (!elements.totalCount || !elements.confirmedCount || !elements.pendingCount || !elements.cancelledCount) {
    return;
  }
  const total = bookings.length;
  const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
  const pending = bookings.filter((b) => b.status === 'pending' || b.status === 'booked').length;
  const cancelled = bookings.filter((b) => b.status === 'cancelled').length;

  elements.totalCount.textContent = String(total);
  elements.confirmedCount.textContent = String(confirmed);
  elements.pendingCount.textContent = String(pending);
  elements.cancelledCount.textContent = String(cancelled);
}

function renderUserRows(bookings) {
  elements.bookingTableBody.innerHTML = '';

  if (bookings.length === 0) {
    elements.emptyState.hidden = false;
    renderUserCheckoutSummary([]);
    return;
  }

  elements.emptyState.hidden = true;
  const displayRows = buildUserBookingRows(bookings, state.bookings);
  renderUserCheckoutSummary(state.bookings);

  for (const row of displayRows) {
    const tr = document.createElement('tr');

    tr.appendChild(userBookingServiceCell(row));
    tr.appendChild(userBookingScheduleCell(row));
    tr.appendChild(statusCell(row.status));
    tr.appendChild(paymentCell(row.paymentStatus || 'unpaid'));

    const actionCell = document.createElement('td');
    const actions = document.createElement('div');
    actions.className = 'action-row';

    const canEdit = !['completed', 'cancelled'].includes(String(row.status || '').toLowerCase());
    const canCancel = row.status !== 'cancelled';
    if (canEdit) {
      actions.append(
        createActionButton(row.isGroupedHydrogen ? 'Edit Package' : 'Edit', () => {
          if (row.isGroupedHydrogen) {
            openHydrogenPackageEditor(row);
            return;
          }
          openSingleSessionBookingEditor(row.booking);
        })
      );
    }
    if (canCancel) {
      actions.append(createActionButton('Cancel', () => changeStatus(row.id, 'cancelled')));
    }
    actions.append(createDangerButton('Delete', () => deleteBooking(row.booking)));

    actionCell.appendChild(actions);
    tr.appendChild(actionCell);
    elements.bookingTableBody.appendChild(tr);
  }
}

function renderUserCheckoutSummary(bookings) {
  if (!elements.userCheckoutSummary || !elements.bookingsPayAllBtn) return;

  const summary = buildUserCartSummary(bookings);
  if (!summary.unitCount) {
    elements.userCheckoutSummary.hidden = true;
    elements.userCheckoutSummary.innerHTML = '';
    elements.bookingsPayAllBtn.hidden = true;
    elements.bookingsPayAllBtn.disabled = true;
    return;
  }

  elements.userCheckoutSummary.hidden = false;
  elements.userCheckoutSummary.innerHTML = `
    <strong>${summary.unitCount} item${summary.unitCount === 1 ? '' : 's'} ready for one payment</strong>
    <span>Total payable: Rs. ${summary.totalAmountInr.toLocaleString('en-IN')}</span>
  `;
  elements.bookingsPayAllBtn.hidden = false;
  elements.bookingsPayAllBtn.disabled = false;
  elements.bookingsPayAllBtn.textContent = `Pay Now`;
}

function buildUserBookingRows(bookings, allBookings = bookings) {
  const byGroup = new Map();
  for (const booking of allBookings) {
    const key = booking.bookingGroupId || `single_${booking.id}`;
    if (!byGroup.has(key)) {
      byGroup.set(key, []);
    }
    byGroup.get(key).push(booking);
  }

  const includedKeys = new Set(
    bookings.map((booking) => booking.bookingGroupId || `single_${booking.id}`)
  );
  const rows = [];
  for (const [groupKey, entries] of byGroup.entries()) {
    if (!includedKeys.has(groupKey)) continue;
    const sortedEntries = [...entries].sort((a, b) =>
      `${a.bookingDate}T${a.bookingTime}`.localeCompare(`${b.bookingDate}T${b.bookingTime}`)
    );
    const hydrogenEntries = sortedEntries.filter((entry) => getBookingCategory(entry.serviceName) === 'HYDROGEN SESSION');
    const addOnEntries = sortedEntries.filter((entry) => getBookingCategory(entry.serviceName) === 'IV ADD-ON');
    const isGroupedHydrogen = Boolean(groupKey.startsWith('hydrogen_') || (sortedEntries[0]?.bookingGroupId && hydrogenEntries.length));

    if (!isGroupedHydrogen) {
      const booking = sortedEntries[0];
      rows.push({
        id: booking.id,
        booking,
        sortKey: `${booking.bookingDate}T${booking.bookingTime}`,
        isGroupedHydrogen: false,
        status: booking.status,
        paymentStatus: booking.paymentStatus || 'unpaid',
        serviceTitle: booking.serviceName,
        serviceMetaLines: [getBookingCategoryLabel(booking.serviceName)],
        scheduleLines: [formatDateTime(booking.bookingDate, booking.bookingTime)],
        serviceText: booking.serviceName,
        dateTimeText: formatDateTime(booking.bookingDate, booking.bookingTime),
      });
      continue;
    }

    const booking = hydrogenEntries[0] || sortedEntries[0];
    const baseServiceName = hydrogenEntries[0]?.serviceName || booking.serviceName || 'Hydrogen Package';
    const breakdown = getHydrogenGroupBreakdown(hydrogenEntries, addOnEntries);
    const addOnDetails = addOnEntries.map((entry) => {
      const linkedIndex = hydrogenEntries.findIndex(
        (slot) => slot.bookingDate === entry.bookingDate && slot.bookingTime === entry.bookingTime
      );
      return linkedIndex >= 0 ? `${entry.serviceName} (Session ${linkedIndex + 1})` : entry.serviceName;
    });

    const slotLines = hydrogenEntries.map(
      (entry, index) => `S${index + 1}: ${formatDateTime(entry.bookingDate, entry.bookingTime)}`
    );
    if (addOnEntries.length) {
      addOnEntries.forEach((entry) => {
        slotLines.push(`Add-on: ${entry.serviceName} with ${formatDateTime(entry.bookingDate, entry.bookingTime)}`);
      });
    }

    rows.push({
      id: booking.id,
      booking,
      sortKey: `${booking.bookingDate}T${booking.bookingTime}`,
      bookingGroupId: booking.bookingGroupId || '',
      baseServiceName,
      extraSessions: Math.max(0, hydrogenEntries.length - getHydrogenSessionCountFromServiceName(baseServiceName)),
      hydrogenEntries,
      addOnEntries,
      isGroupedHydrogen: true,
      status: summarizeGroupStatus(sortedEntries),
      paymentStatus: summarizeGroupPaymentStatus(sortedEntries),
      serviceTitle: 'Hydrogen Package Booking',
      serviceMetaLines: [
        baseServiceName,
        ...(addOnDetails.length ? [`Add-on: ${addOnDetails.join(', ')}`] : []),
      ],
      scheduleLines: [hydrogenEntries[0] ? formatDateTime(hydrogenEntries[0].bookingDate, hydrogenEntries[0].bookingTime) : '-'],
      detailSections: [
        { title: 'Sessions', lines: slotLines },
        ...(addOnDetails.length ? [{ title: 'Add-on', lines: addOnDetails }] : []),
        ...(breakdown.totalAmountInr > 0
          ? [
              {
                title: 'Payment',
                lines: [breakdown.breakdownText, `Total: Rs. ${breakdown.totalAmountInr.toLocaleString('en-IN')}`],
              },
            ]
          : []),
      ],
      serviceText: ['Hydrogen Package Booking', baseServiceName].join('\n'),
      dateTimeText: slotLines.join('\n'),
    });
  }

  return rows.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}

function buildUserCartSummary(bookings = state.bookings) {
  const payableBookings = (Array.isArray(bookings) ? bookings : []).filter((booking) => {
    if (String(booking.status || '').toLowerCase() === 'cancelled') return false;
    if (String(booking.paymentStatus || '').toLowerCase() === 'paid') return false;
    const service = getServiceCatalogEntry(booking.serviceName);
    return !service?.membershipOnly;
  });

  const rows = buildUserBookingRows(payableBookings, payableBookings);
  let totalAmountInr = 0;
  for (const row of rows) {
    if (row.isGroupedHydrogen) {
      totalAmountInr += Number(getHydrogenGroupBreakdown(row.hydrogenEntries || [], row.addOnEntries || []).totalAmountInr || 0);
    } else {
      totalAmountInr += Number(getDisplayedServicePriceInr(row.booking?.serviceName || row.serviceTitle || '') || 0);
    }
  }

  return {
    unitCount: rows.length,
    bookingCount: payableBookings.length,
    totalAmountInr,
  };
}

function renderAdminRows(bookings) {
  elements.adminBookingTableBody.innerHTML = '';

  if (bookings.length === 0) {
    elements.adminEmptyState.hidden = false;
    return;
  }

  elements.adminEmptyState.hidden = true;

  for (const booking of bookings) {
    const tr = document.createElement('tr');
    tr.appendChild(cell(`${booking.clientName}\n${booking.clientMobile || '-'}`));
    tr.appendChild(cell(booking.serviceName));
    tr.appendChild(cell(formatDateTime(booking.bookingDate, booking.bookingTime)));
    tr.appendChild(statusCell(booking.status));
    tr.appendChild(paymentCell(booking.paymentStatus || 'unpaid'));

    const actionCell = document.createElement('td');
    const actions = document.createElement('div');
    actions.className = 'action-row';

    if ((booking.paymentStatus || 'unpaid') !== 'paid' && booking.status !== 'cancelled') {
      actions.append(createActionButton('Copy Payment Link', () => copyBookingPaymentLink(booking.id)));
    }

    actions.append(
      createActionButton('Confirm', () => changeStatus(booking.id, 'confirmed')),
      createActionButton('Complete', () => changeStatus(booking.id, 'completed')),
      createActionButton('Cancel', () => changeStatus(booking.id, 'cancelled'))
    );

    actionCell.appendChild(actions);
    tr.appendChild(actionCell);
    elements.adminBookingTableBody.appendChild(tr);
  }
}

function renderAdminMembershipOrders() {
  if (!elements.adminMembershipOrdersList || !elements.adminMembershipEmptyState) return;

  elements.adminMembershipOrdersList.innerHTML = '';
  const paidOrders = (state.adminMembershipOrders || []).filter(
    (order) => String(order?.status || '').trim().toLowerCase() === 'paid'
  );
  if (!paidOrders.length) {
    elements.adminMembershipEmptyState.hidden = false;
    return;
  }

  elements.adminMembershipEmptyState.hidden = true;
  for (const order of paidOrders) {
    const card = document.createElement('article');
    card.className = 'admin-membership-card';
    const amountInr = Math.round(Number(order.amountPaise || 0) / 100);
    const memberDetails = Array.isArray(order.memberDetails) ? order.memberDetails : [];
    card.innerHTML = `
      <div class="admin-membership-head">
        <div>
          <h3>${escapeHtml(getMembershipPlanDisplayName(order.planId))}</h3>
          <p>${escapeHtml(order.userName || '-')} • ${escapeHtml(order.userEmail || '-')} • ${escapeHtml(order.userMobile || '-')}</p>
        </div>
        <span class="status-chip payment-${escapeHtml(String(order.status || 'created').toLowerCase())}">${escapeHtml(
      String(order.status || 'created')
    )}</span>
      </div>
      <div class="admin-membership-meta">
        <div class="admin-membership-meta-item">
          <strong>People Count</strong>
          <span>${escapeHtml(String(order.peopleCount || 0))}</span>
        </div>
        <div class="admin-membership-meta-item">
          <strong>Amount</strong>
          <span>Rs. ${amountInr.toLocaleString('en-IN')}</span>
        </div>
        <div class="admin-membership-meta-item">
          <strong>Created</strong>
          <span>${escapeHtml(formatDateOnly(order.createdAt))}</span>
        </div>
        <div class="admin-membership-meta-item">
          <strong>Paid At</strong>
          <span>${order.paidAt ? escapeHtml(formatDateOnly(order.paidAt)) : '-'}</span>
        </div>
      </div>
      <div class="admin-membership-members">
        <h4>Covered Person Details</h4>
      </div>
    `;

    const membersWrap = card.querySelector('.admin-membership-members');
    if (!memberDetails.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'No person details saved for this membership order.';
      membersWrap.appendChild(empty);
    } else {
      memberDetails.forEach((member, index) => {
        const row = document.createElement('div');
        row.className = 'admin-member-grid';
        row.innerHTML = `
          <div class="admin-member-field">
            <strong>Person</strong>
            <span>${index + 1}</span>
          </div>
          <div class="admin-member-field">
            <strong>Name</strong>
            <span>${escapeHtml(member?.name || '-')}</span>
          </div>
          <div class="admin-member-field">
            <strong>Place</strong>
            <span>${escapeHtml(member?.place || '-')}</span>
          </div>
          <div class="admin-member-field">
            <strong>Email / Contact</strong>
            <span>${escapeHtml(member?.email || '-')}<br />${escapeHtml(member?.contactNumber || '-')}</span>
          </div>
        `;
        membersWrap.appendChild(row);
      });
    }

    elements.adminMembershipOrdersList.appendChild(card);
  }
}

function cell(content) {
  const td = document.createElement('td');
  td.textContent = content;
  return td;
}

function multilineCell(content) {
  const td = cell(content);
  td.style.whiteSpace = 'pre-line';
  return td;
}

function userBookingServiceCell(row) {
  const td = document.createElement('td');
  const wrap = document.createElement('div');
  wrap.className = 'booking-service-block';

  const title = document.createElement('div');
  title.className = 'booking-service-title';
  title.textContent = row.serviceTitle || row.serviceText || '-';
  wrap.appendChild(title);

  const metaLines = Array.isArray(row.serviceMetaLines) ? row.serviceMetaLines : [];
  for (const line of metaLines) {
    const text = String(line || '').trim();
    if (!text) continue;
    const meta = document.createElement('div');
    meta.className = 'booking-service-meta';
    meta.textContent = text;
    wrap.appendChild(meta);
  }

  if (Array.isArray(row.detailSections) && row.detailSections.length) {
    const details = document.createElement('details');
    details.className = 'booking-details-toggle';
    const summary = document.createElement('summary');
    summary.textContent = 'View Details';
    details.appendChild(summary);

    for (const section of row.detailSections) {
      const lines = Array.isArray(section?.lines) ? section.lines.filter(Boolean) : [];
      if (!lines.length) continue;
      const block = document.createElement('div');
      block.className = 'booking-details-section';

      const heading = document.createElement('div');
      heading.className = 'booking-details-heading';
      heading.textContent = section.title || 'Details';
      block.appendChild(heading);

      for (const line of lines) {
        const item = document.createElement('div');
        item.className = 'booking-details-line';
        item.textContent = String(line || '').trim();
        block.appendChild(item);
      }

      details.appendChild(block);
    }

    wrap.appendChild(details);
  }

  td.appendChild(wrap);
  return td;
}

function userBookingScheduleCell(row) {
  const td = document.createElement('td');
  const wrap = document.createElement('div');
  wrap.className = 'booking-schedule-block';

  const scheduleLines = Array.isArray(row.scheduleLines) ? row.scheduleLines : [row.dateTimeText || '-'];
  for (const line of scheduleLines) {
    const text = String(line || '').trim();
    if (!text) continue;
    const item = document.createElement('div');
    item.className = 'booking-schedule-line';
    item.textContent = text;
    wrap.appendChild(item);
  }

  td.appendChild(wrap);
  return td;
}

function getBookingCategory(serviceName) {
  const normalized = String(serviceName || '').trim().toLowerCase();
  const matched = state.services.find((service) => String(service.name || '').trim().toLowerCase() === normalized);
  const category = String(matched?.category || '').toUpperCase();
  if (category === 'HYDROGEN SESSION') return 'HYDROGEN SESSION';
  if (category === 'MEMBERSHIP SERVICES') return 'MEMBERSHIP SERVICES';
  if (category === 'IV THERAPIES' || category === 'IV SHOTS') return 'IV ADD-ON';
  if (normalized.includes('hydrogen') || normalized.startsWith('h2 ')) return 'HYDROGEN SESSION';
  return '';
}

function getBookingCategoryLabel(serviceName) {
  const category = getBookingCategory(serviceName);
  if (category === 'HYDROGEN SESSION') return 'Hydrogen Session';
  if (category === 'IV ADD-ON') return 'IV Therapy / IV Shot';
  if (category === 'MEMBERSHIP SERVICES') return 'Membership Service';
  return 'Service Booking';
}

function getServiceCatalogEntry(serviceName) {
  const normalized = String(serviceName || '').trim().toLowerCase();
  return state.services.find((service) => String(service.name || '').trim().toLowerCase() === normalized) || null;
}

function getDisplayedServicePriceInr(serviceName) {
  const service = getServiceCatalogEntry(serviceName);
  return Number(service?.effectivePriceInr ?? service?.priceInr ?? 0);
}

function getCurrentContextBookings() {
  if (state.user?.role === 'admin') {
    if (!state.adminResolvedCustomer?.id) return [];
    return state.bookings.filter((booking) => String(booking.userId) === String(state.adminResolvedCustomer.id));
  }
  return state.bookings;
}

function getIvCooldownAlertMessage(conflict) {
  return `An IV Therapy/IV Shot can be booked again only after 2 weeks. Existing IV booking found on ${conflict?.bookingDate}. Reach out to us to book if you still want this.`;
}

function findIvCooldownConflictClient(serviceName, bookingDate, excludeBookingId = '', excludeGroupId = '') {
  if (state.user?.role !== 'user') return null;
  if (getBookingCategory(serviceName) !== 'IV ADD-ON') return null;
  const targetDate = new Date(`${String(bookingDate || '').trim()}T00:00:00`).getTime();
  if (Number.isNaN(targetDate)) return null;

  return getCurrentContextBookings().find((booking) => {
    if (booking.status === 'cancelled') return false;
    if (excludeBookingId && String(booking.id) === String(excludeBookingId)) return false;
    if (excludeGroupId && String(booking.bookingGroupId || '') === String(excludeGroupId)) return false;
    if (getBookingCategory(booking.serviceName) !== 'IV ADD-ON') return false;
    const existingDate = new Date(`${booking.bookingDate}T00:00:00`).getTime();
    if (Number.isNaN(existingDate)) return false;
    const diffDays = Math.abs(Math.round((existingDate - targetDate) / 86400000));
    return diffDays < IV_REBOOK_COOLDOWN_DAYS;
  }) || null;
}

function findHydrogenDailyLimitConflictClient(slots = [], excludeGroupId = '') {
  if (state.user?.role !== 'user') return null;

  const existingByDate = new Map();
  getCurrentContextBookings().forEach((booking) => {
    if (booking.status === 'cancelled') return;
    if (excludeGroupId && booking.bookingGroupId === excludeGroupId) return;
    if (getBookingCategory(booking.serviceName) !== 'HYDROGEN SESSION') return;
    existingByDate.set(booking.bookingDate, Number(existingByDate.get(booking.bookingDate) || 0) + 1);
  });

  const requestedByDate = new Map();
  (Array.isArray(slots) ? slots : []).forEach((slot) => {
    const bookingDate = String(slot?.bookingDate || '').trim();
    if (!bookingDate) return;
    requestedByDate.set(bookingDate, Number(requestedByDate.get(bookingDate) || 0) + 1);
  });

  for (const [bookingDate, requestedTotal] of requestedByDate.entries()) {
    const existingTotal = Number(existingByDate.get(bookingDate) || 0);
    if (existingTotal + requestedTotal > MAX_HYDROGEN_SESSIONS_PER_DAY_PER_USER) {
      return { bookingDate, existingTotal, requestedTotal };
    }
  }

  return null;
}

function hasHydrogenPackageAddOnOnDateClient(bookingDate, excludeGroupId = '') {
  const targetDate = String(bookingDate || '').trim();
  if (!targetDate) return false;

  return getCurrentContextBookings().some((booking) => {
    if (booking.bookingDate !== targetDate) return false;
    if (!booking.bookingGroupId) return false;
    if (excludeGroupId && booking.bookingGroupId === excludeGroupId) return false;
    if (booking.status === 'cancelled') return false;
    return getBookingCategory(booking.serviceName) === 'IV ADD-ON';
  });
}

function hasStandaloneIvOnDateClient(bookingDate, excludeGroupId = '') {
  const targetDate = String(bookingDate || '').trim();
  if (!targetDate) return false;

  return getCurrentContextBookings().some((booking) => {
    if (booking.bookingDate !== targetDate) return false;
    if (booking.status === 'cancelled') return false;
    if (excludeGroupId && booking.bookingGroupId === excludeGroupId) return false;
    if (booking.bookingGroupId) return false;
    return getBookingCategory(booking.serviceName) === 'IV ADD-ON';
  });
}

function getHydrogenGroupBreakdown(hydrogenEntries, addOnEntries) {
  const baseServiceName = hydrogenEntries[0]?.serviceName || '';
  const packageSessions = getHydrogenSessionCountFromServiceName(baseServiceName);
  const extraSessions = Math.max(0, hydrogenEntries.length - packageSessions);
  const singleSessionService =
    state.services.find(
      (service) =>
        String(service.category || '').toUpperCase() === 'HYDROGEN SESSION' &&
        getHydrogenSessionCountFromServiceName(service.name) === 1
    ) || null;
  const basePriceInr = getDisplayedServicePriceInr(baseServiceName);
  const extraSessionPriceInr = Number(singleSessionService?.effectivePriceInr ?? singleSessionService?.priceInr ?? 0);
  const addOnParts = addOnEntries.map((entry) => ({
    label: entry.serviceName,
    amountInr: getDisplayedServicePriceInr(entry.serviceName),
  }));
  const breakdownParts = [];
  if (basePriceInr > 0) {
    breakdownParts.push(`${baseServiceName} Rs. ${basePriceInr.toLocaleString('en-IN')}`);
  }
  if (extraSessions > 0 && extraSessionPriceInr > 0) {
    breakdownParts.push(`${extraSessions} extra session${extraSessions === 1 ? '' : 's'} Rs. ${(extraSessions * extraSessionPriceInr).toLocaleString('en-IN')}`);
  }
  addOnParts.forEach((item) => {
    if (item.amountInr > 0) {
      breakdownParts.push(`${item.label} Rs. ${item.amountInr.toLocaleString('en-IN')}`);
    }
  });

  const totalAmountInr =
    basePriceInr +
    extraSessions * extraSessionPriceInr +
    addOnParts.reduce((sum, item) => sum + Number(item.amountInr || 0), 0);

  return {
    breakdownText: breakdownParts.join(' + '),
    totalAmountInr,
  };
}

function summarizeGroupStatus(bookings) {
  const statuses = bookings.map((booking) => String(booking.status || '').toLowerCase());
  if (statuses.every((status) => status === 'cancelled')) return 'cancelled';
  if (statuses.some((status) => status === 'pending')) return 'pending';
  if (statuses.some((status) => status === 'booked')) return 'booked';
  if (statuses.some((status) => status === 'confirmed')) return 'confirmed';
  if (statuses.some((status) => status === 'completed')) return 'completed';
  return statuses[0] || 'pending';
}

function summarizeGroupPaymentStatus(bookings) {
  const paymentStatuses = bookings.map((booking) => String(booking.paymentStatus || 'unpaid').toLowerCase());
  if (paymentStatuses.every((status) => status === 'paid')) return 'paid';
  if (paymentStatuses.some((status) => status === 'payment_pending')) return 'payment_pending';
  return 'unpaid';
}

function statusCell(status) {
  const td = document.createElement('td');
  td.innerHTML = `<span class="status-chip status-${status}">${status}</span>`;
  return td;
}

function paymentCell(paymentStatus) {
  const td = document.createElement('td');
  td.innerHTML = `<span class="status-chip payment-${paymentStatus}">${paymentStatus}</span>`;
  return td;
}

function createActionButton(label, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'action-btn';
  button.textContent = label;
  button.addEventListener('click', async () => {
    try {
      await onClick();
    } catch (error) {
      alert(error.message || 'Action failed');
    }
  });
  return button;
}

function createDangerButton(label, onClick) {
  const button = createActionButton(label, onClick);
  button.classList.add('danger');
  return button;
}

function copyTextToClipboard(value) {
  const text = String(value || '').trim();
  if (!text) return;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
}

function getMembershipPlanDisplayName(planId) {
  const key = String(planId || '').trim();
  const labelMap = {
    h2_single: '1 Person Membership',
    h2_two: '2 Person Membership',
    h2_four: '4 Person Membership',
    h2_add_person: 'Add Person',
  };
  return labelMap[key] || key || 'Membership';
}

function formatDateOnly(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatDateTime(dateISO, time24) {
  if (!dateISO || !time24) return '-';
  const date = new Date(`${dateISO}T${time24}`);
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
  });

  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : {};

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
