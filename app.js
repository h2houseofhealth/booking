const state = {
  user: null,
  bookings: [],
  services: [],
  membership: {
    plans: [],
    active: false,
    current: null,
  },
  selectedServiceCategory: null,
  selectedHydrogenServiceName: '',
  selectedHydrogenExtraSessions: 0,
  selectedHydrogenSlots: [],
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
  { value: '10:00', label: '10:00 AM - 11:00 AM' },
  { value: '11:00', label: '11:00 AM - 12:00 PM' },
  { value: '12:00', label: '12:00 PM - 1:00 PM' },
  { value: '13:00', label: '1:00 PM - 2:00 PM' },
  { value: '14:00', label: '2:00 PM - 3:00 PM' },
  { value: '15:00', label: '3:00 PM - 4:00 PM' },
  { value: '16:00', label: '4:00 PM - 5:00 PM' },
  { value: '17:00', label: '5:00 PM - 6:00 PM' },
  { value: '18:00', label: '6:00 PM - 7:00 PM' },
  { value: '19:00', label: '7:00 PM - 8:00 PM' },
];
const BOOKING_WINDOW_DAYS = 60;

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

  serviceGrid: document.getElementById('serviceGrid'),
  serviceEmpty: document.getElementById('serviceEmpty'),
  membershipPlans: document.getElementById('membershipPlans'),
  membershipStatusText: document.getElementById('membershipStatusText'),

  searchInput: document.getElementById('searchInput'),
  statusFilter: document.getElementById('statusFilter'),
  dateFilter: document.getElementById('dateFilter'),
  resetFiltersBtn: document.getElementById('resetFiltersBtn'),

  bookingTableBody: document.getElementById('bookingTableBody'),
  emptyState: document.getElementById('emptyState'),
  adminBookingTableBody: document.getElementById('adminBookingTableBody'),
  adminEmptyState: document.getElementById('adminEmptyState'),

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
    state.membership = { plans: [], active: false, current: null };
    state.selectedServiceCategory = null;
    state.selectedHydrogenServiceName = '';
    state.selectedHydrogenExtraSessions = 0;
    state.selectedHydrogenSlots = [];
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
    renderAuthMode();
    render();
  });

  elements.profileBtn.addEventListener('click', openProfileDialog);
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

async function loadDashboardData() {
  const [servicesResult, bookingsResult, membershipResult] = await Promise.all([
    api('/api/services'),
    api('/api/bookings'),
    state.user?.role === 'user' ? api('/api/membership/plans') : Promise.resolve({ plans: [], active: false, current: null }),
  ]);
  state.services = servicesResult.services || [];
  state.bookings = bookingsResult.bookings || [];
  state.membership = {
    plans: membershipResult.plans || [],
    active: Boolean(membershipResult.active),
    current: membershipResult.current || null,
  };
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
  const requestId = ++availabilityRequestId;
  state.slotAvailabilityLoading = true;
  renderServices();

  try {
    const result = await api(
      `/api/services/availability?bookingDate=${encodeURIComponent(state.selectedServiceDate)}&category=${encodeURIComponent(
        state.selectedServiceCategory
      )}`
    );
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
    option.textContent = `${service.name} - Rs. ${Number(service.effectivePriceInr ?? service.priceInr ?? 0).toLocaleString('en-IN')}`;
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

  if (booking) {
    elements.dialogTitle.textContent = 'Edit Booking';
    elements.bookingId.value = String(booking.id);
    populateServiceOptions(booking.serviceName);
    populateBookingDateOptions(booking.bookingDate);
    elements.bookingTime.value = booking.bookingTime;
    elements.bookingNotes.value = booking.notes || '';
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

  const id = elements.bookingId.value;
  if (id) {
    await api(`/api/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } else {
    await api('/api/bookings', {
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
        await api('/api/payments/verify', {
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
        alert('Payment successful. Booking marked as booked.');
      } catch (error) {
        alert(error.message || 'Payment verification failed.');
      }
    },
    modal: {
      ondismiss: () => {
        alert('Payment was canceled.');
      },
    },
  };

  const checkout = new window.Razorpay(options);
  checkout.open();
}

async function saveHydrogenPackBookings({ serviceName, extraSessions, slots }) {
  const result = await api('/api/hydrogen/book-pack', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      serviceName,
      extraSessions,
      slots,
    }),
  });

  const summary = result.summary || {};
  const lines = [
    `Service: ${summary.serviceName || serviceName}`,
    `Package Sessions: ${summary.packageSessions ?? '-'}`,
    `Extra Sessions: ${summary.extraSessions ?? 0}`,
    `Total Sessions: ${summary.totalSessions ?? slots.length}`,
    `Estimated Amount: Rs. ${Number(summary.totalAmountInr || 0).toLocaleString('en-IN')}`,
    '',
    'Booked Slots:',
    ...(result.bookings || []).map((item) => `${item.bookingDate} ${item.bookingTime}`),
  ];

  state.selectedHydrogenSlots = [];
  state.selectedHydrogenExtraSessions = 0;
  state.activeHydrogenSessionIndex = 0;
  state.activeHydrogenSessionDate = '';
  state.activeHydrogenSessionTime = '';
  state.selectedServiceCategory = null;
  state.selectedHydrogenServiceName = '';
  await loadDashboardData();
  render();
  alert(`Booking Summary\n\n${lines.join('\n')}`);
}

async function deleteBooking(id, serviceName) {
  const ok = confirm(`Delete booking for ${serviceName}?`);
  if (!ok) return;

  await api(`/api/bookings/${id}`, { method: 'DELETE' });
  await loadDashboardData();
  render();
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
    return;
  }

  const isAdmin = state.user.role === 'admin';
  document.querySelectorAll('.user-only').forEach((el) => {
    el.hidden = isAdmin;
  });
  document.querySelectorAll('.admin-only').forEach((el) => {
    el.hidden = !isAdmin;
  });

  elements.userName.textContent = state.user.name;
  elements.userRole.textContent = state.user.role;
  renderProfileAvatar();

  const filtered = getFilteredBookings(state.bookings);
  renderStats(filtered);
  renderMembership();
  renderServices();

  if (isAdmin) {
    renderAdminRows(filtered);
  } else {
    renderUserRows(filtered);
  }
}

function renderServices() {
  if (!elements.serviceGrid) return;

  elements.serviceGrid.innerHTML = '';
  if (!state.services.length) {
    elements.serviceEmpty.hidden = false;
    return;
  }

  elements.serviceEmpty.hidden = true;
  const orderedCategories = ['HYDROGEN SESSION', 'IV THERAPIES', 'IV SHOTS'];
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
      state.selectedHydrogenSlots = [];
      state.selectedHydrogenExtraSessions = 0;
      state.activeHydrogenSessionIndex = 0;
      state.activeHydrogenSessionDate = '';
      state.activeHydrogenSessionTime = '';
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
  const section = document.createElement('section');
  section.className = 'service-section service-cluster';
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
    state.selectedServiceCategory = null;
    state.selectedHydrogenServiceName = '';
    state.selectedHydrogenExtraSessions = 0;
    state.selectedHydrogenSlots = [];
    state.activeHydrogenSessionIndex = 0;
    state.activeHydrogenSessionDate = '';
    state.activeHydrogenSessionTime = '';
    state.slotAvailability = {};
    state.slotCapacityByService = {};
    state.slotAvailabilityLoading = false;
    renderServices();
  });
  section.querySelector('.service-cluster-head').appendChild(backButton);

  if (!isHydrogenCategory) {
    state.selectedHydrogenServiceName = '';
    state.selectedHydrogenExtraSessions = 0;
    state.selectedHydrogenSlots = [];
  }

  if (isHydrogenCategory) {
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
    const consolidatedAmount = Number(selectedService.effectivePriceInr || 0) + extraSessions * extraSessionPrice;

    const layout = document.createElement('div');
    layout.className = 'hydrogen-layout';

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
    planSelect.addEventListener('change', () => {
      state.selectedHydrogenServiceName = planSelect.value;
      state.selectedHydrogenSlots = [];
      state.activeHydrogenSessionIndex = 0;
      state.activeHydrogenSessionDate = '';
      state.activeHydrogenSessionTime = '';
      renderServices();
    });
    const extraInput = sidebar.querySelector('.hydrogen-extra-input');
    extraInput.addEventListener('input', () => {
      const parsed = Math.max(0, Number(extraInput.value || 0));
      state.selectedHydrogenExtraSessions = Number.isFinite(parsed) ? Math.floor(parsed) : 0;
      state.selectedHydrogenSlots = [];
      state.activeHydrogenSessionIndex = 0;
      state.activeHydrogenSessionDate = '';
      state.activeHydrogenSessionTime = '';
      renderServices();
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
        renderServices();
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

    const card = document.createElement('article');
    card.className = 'doctor-card service-card';
    card.innerHTML = `
      <div class="service-card-head">
        <h3>${escapeHtml(selectedService.name)}</h3>
        <p class="service-card-subline">Configure sessions and save booking</p>
      </div>
      <div class="service-price-panel">
        <p class="service-price-line">
          <span class="price-label">Consolidated Price</span>
          <strong>Rs. ${consolidatedAmount.toLocaleString('en-IN')}</strong>
        </p>
        <p class="service-price-meta">Package: Rs. ${Number(selectedService.effectivePriceInr || 0).toLocaleString(
          'en-IN'
        )} | Extra/session: Rs. ${extraSessionPrice.toLocaleString('en-IN')}</p>
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
    for (const optionData of SLOT_OPTIONS) {
      const option = document.createElement('option');
      option.value = optionData.value;
      option.textContent = optionData.label;
      timeSelect.appendChild(option);
    }
    timeSelect.value = editorTime;
    const dateInput = editor.querySelector('.hydrogen-editor-date');
    dateInput.addEventListener('change', () => {
      state.activeHydrogenSessionDate = dateInput.value || getTodayIsoDate();
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
    card.appendChild(selectedSummary);

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'btn btn-primary';
    saveBtn.textContent = assignedCount === requiredSlots ? 'Save Booking' : `Set ${requiredSlots - assignedCount} more session(s)`;
    saveBtn.disabled = assignedCount !== requiredSlots || requiredSlots <= 0;
    saveBtn.addEventListener('click', async () => {
      try {
        await saveHydrogenPackBookings({
          serviceName: selectedService.name,
          extraSessions,
          slots: state.selectedHydrogenSlots.slice(0, requiredSlots),
        });
      } catch (error) {
        alert(error.message || 'Unable to save hydrogen booking.');
      }
    });
    card.appendChild(saveBtn);
    main.appendChild(card);
    layout.appendChild(main);
    section.appendChild(layout);
    elements.serviceGrid.appendChild(section);
    return;
  }

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

  const grid = document.createElement('div');
  grid.className = 'service-card-grid';
  for (const service of selectedServices) {
    const card = document.createElement('article');
    card.className = 'doctor-card service-card';
    const effectivePrice = Number(service.effectivePriceInr ?? service.priceInr ?? 0);
    const hasDualHydrogenPrices =
      String(service.category || '').toUpperCase() === 'HYDROGEN SESSION' &&
      Number(service.memberPriceInr) > 0 &&
      Number(service.nonMemberPriceInr) > 0;
    const memberPriceText = Number(service.memberPriceInr).toLocaleString('en-IN');
    const nonMemberPriceText = Number(service.nonMemberPriceInr).toLocaleString('en-IN');

    card.innerHTML = `
      <div class="service-card-head">
        <h3>${escapeHtml(service.name)}</h3>
        <p class="service-card-subline">${isHydrogenCategory ? 'Select date and slot below' : 'Select this plan to continue'}</p>
      </div>
      <div class="service-price-panel">
        <p class="service-price-line">
          <span class="price-label">Your Price</span>
          <strong>Rs. ${effectivePrice.toLocaleString('en-IN')}</strong>
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

  const orderedPlanIds = ['h2_single', 'h2_two', 'h2_four', 'h2_add_person'];
  const plans = orderedPlanIds
    .map((id) => (state.membership.plans || []).find((plan) => String(plan.id) === id))
    .filter(Boolean);

  if (!plans.length) {
    elements.membershipPlans.innerHTML = '<p class="empty-state">Membership plans are not configured.</p>';
    return;
  }

  elements.membershipPlans.innerHTML = '';
  for (const plan of plans) {
    const isAddPerson = String(plan.id) === 'h2_add_person';
    const isCurrentBasePlan = active && !isAddPerson && String(current.plan || '') === String(plan.id);
    const canAddPerson = isAddPerson && active;
    const disabled = isCurrentBasePlan || (isAddPerson && !canAddPerson);

    const card = document.createElement('article');
    card.className = 'membership-card';
    card.innerHTML = `
      <h3>${escapeHtml(plan.name)}</h3>
      <p class="membership-price">Rs. ${Number(plan.priceInr || 0).toLocaleString('en-IN')}</p>
      <p>${escapeHtml(plan.peopleCount)} member${Number(plan.peopleCount) > 1 ? 's' : ''} • ${escapeHtml(
      plan.validityDays
    )} days</p>
      <p>${escapeHtml(plan.perks || '')}</p>
    `;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-primary';
    if (isCurrentBasePlan) {
      button.textContent = 'Active';
    } else if (isAddPerson && !canAddPerson) {
      button.textContent = 'Requires Active Plan';
    } else if (isAddPerson) {
      button.textContent = 'Pay & Add Person';
    } else {
      button.textContent = 'Pay & Activate';
    }
    button.disabled = disabled;
    button.addEventListener('click', async () => {
      try {
        await activateMembershipWithPayment(plan);
      } catch (error) {
        alert(error.message || 'Unable to activate membership.');
      }
    });

    card.appendChild(button);
    elements.membershipPlans.appendChild(card);
  }
}

async function activateMembershipWithPayment(plan) {
  const order = await api('/api/membership/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId: plan.id }),
  });

  if (!window.Razorpay) {
    throw new Error('Razorpay SDK not loaded');
  }

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
        render();
        alert(result.message || 'Membership activated.');
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
    return;
  }

  elements.emptyState.hidden = true;

  for (const booking of bookings) {
    const tr = document.createElement('tr');

    tr.appendChild(cell(booking.serviceName));
    tr.appendChild(cell(formatDateTime(booking.bookingDate, booking.bookingTime)));
    tr.appendChild(statusCell(booking.status));
    tr.appendChild(paymentCell(booking.paymentStatus || 'unpaid'));

    const actionCell = document.createElement('td');
    const actions = document.createElement('div');
    actions.className = 'action-row';

    const canPay = booking.paymentStatus === 'unpaid' && booking.status !== 'cancelled';
    if (canPay) {
      actions.append(createActionButton('Pay Now', () => payBooking(booking.id)));
    }

    actions.append(
      createActionButton('Edit', () => openDialog(booking)),
      createActionButton('Cancel', () => changeStatus(booking.id, 'cancelled')),
      createDangerButton('Delete', () => deleteBooking(booking.id, booking.serviceName))
    );

    actionCell.appendChild(actions);
    tr.appendChild(actionCell);
    elements.bookingTableBody.appendChild(tr);
  }
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

function cell(content) {
  const td = document.createElement('td');
  td.textContent = content;
  return td;
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
