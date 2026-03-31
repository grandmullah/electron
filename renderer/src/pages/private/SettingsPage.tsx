import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { Header } from "../../components/Header";
import AuthService from "../../services/authService";
import { loginSuccess } from "../../store/authSlice";
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  Alert,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Grid,
  Fade,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import GridLegacy from "@mui/material/GridLegacy";
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  DeleteForever as DeleteIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";

interface SettingsPageProps {
  onNavigate: (
    page: "home" | "dashboard" | "settings" | "games" | "agent" | "history" | "management"
  ) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState(0);

  // Profile form state
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Preferences state
  const [preferences, setPreferences] = useState({
    oddsFormat: (user?.preferences as any)?.odds_format || "decimal",
    timezone: (user?.preferences as any)?.timezone || "UTC",
    notifications: {
      betSettled: (user?.preferences as any)?.notifications?.bet_settled ?? true,
      oddsChanged: (user?.preferences as any)?.notifications?.odds_changed ?? false,
      newGames: (user?.preferences as any)?.notifications?.new_games ?? true,
    },
  });
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [preferencesMessage, setPreferencesMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Delete account dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setEmail(user.email || "");
      setPreferences({
        oddsFormat: (user.preferences as any)?.odds_format || "decimal",
        timezone: (user.preferences as any)?.timezone || "UTC",
        notifications: {
          betSettled: (user.preferences as any)?.notifications?.bet_settled ?? true,
          oddsChanged: (user.preferences as any)?.notifications?.odds_changed ?? false,
          newGames: (user.preferences as any)?.notifications?.new_games ?? true,
        },
      });
    }
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Clear messages when switching tabs
    setProfileMessage(null);
    setPasswordMessage(null);
    setPreferencesMessage(null);
  };

  const handleUpdateProfile = async () => {
    setIsUpdatingProfile(true);
    setProfileMessage(null);
    try {
      const response = await AuthService.updateProfile({
        first_name: firstName,
        last_name: lastName,
        email: email,
      });

      if (response.success) {
        // Update Redux store with new user data
        if (user && response.user) {
          dispatch(loginSuccess({
            ...user,
            first_name: response.user.first_name,
            last_name: response.user.last_name,
            email: response.user.email,
          }));
        }
        setProfileMessage({ type: "success", text: "Profile updated successfully" });
      } else {
        setProfileMessage({ type: "error", text: response.user ? "Update failed" : "Unknown error" });
      }
    } catch (err: any) {
      setProfileMessage({ type: "error", text: err.message || "Failed to update profile" });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }

    setIsChangingPassword(true);
    setPasswordMessage(null);
    try {
      const response = await AuthService.changePassword(currentPassword, newPassword);
      if (response.success) {
        setPasswordMessage({ type: "success", text: "Password changed successfully" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMessage({ type: "error", text: response.message || "Failed to change password" });
      }
    } catch (err: any) {
      setPasswordMessage({ type: "error", text: err.message || "Failed to change password" });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsSavingPreferences(true);
    setPreferencesMessage(null);
    try {
      const response = await AuthService.updatePreferences(preferences);
      if (response.success) {
        // Update Redux store
        if (user && response.user) {
          dispatch(loginSuccess({
            ...user,
            preferences: response.user.preferences,
          }));
        }
        setPreferencesMessage({ type: "success", text: "Preferences saved successfully" });
      } else {
        setPreferencesMessage({ type: "error", text: "Failed to save preferences" });
      }
    } catch (err: any) {
      setPreferencesMessage({ type: "error", text: err.message || "Failed to save preferences" });
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      setDeleteMessage({ type: "error", text: "Please type DELETE to confirm" });
      return;
    }

    setIsDeleting(true);
    setDeleteMessage(null);
    try {
      const response = await AuthService.deleteAccount(deletePassword);
      if (response.success) {
        // Logout and redirect to home
        AuthService.logout();
        window.location.href = "/";
      } else {
        setDeleteMessage({ type: "error", text: response.message || "Failed to delete account" });
      }
    } catch (err: any) {
      setDeleteMessage({ type: "error", text: err.message || "Failed to delete account" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteConfirmation("");
    setDeletePassword("");
    setDeleteMessage(null);
  };

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        color: "text.primary",
      }}
    >
      <Header onNavigate={onNavigate} currentPage="settings" />

      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Paper
          elevation={2}
          sx={{
            p: { xs: 2, md: 3 },
            mb: 3,
            borderRadius: 2,
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account settings, preferences, and security
          </Typography>
        </Paper>

        {/* User Info Card */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <GridLegacy container spacing={2} alignItems="center">
            <GridLegacy item>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  fontWeight: 700,
                }}
              >
                {user?.name?.charAt(0).toUpperCase() ||
                  user?.phone_number?.charAt(0).toUpperCase() ||
                  "U"}
              </Box>
            </GridLegacy>
            <GridLegacy item xs>
              <Typography variant="h6" fontWeight={600}>
                {user?.name || user?.phone_number || "User"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.phone_number}
              </Typography>
              <Box display="flex" gap={1} mt={1}>
                <Chip
                  label={user?.role?.toUpperCase()}
                  size="small"
                  color={
                    user?.role === "admin"
                      ? "error"
                      : user?.role === "super_agent"
                      ? "warning"
                      : user?.role === "agent"
                      ? "info"
                      : "default"
                  }
                />
                <Chip
                  label={`${user?.currency || "SSP"} ${user?.balance?.toLocaleString() || "0.00"}`}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </GridLegacy>
          </GridLegacy>
        </Paper>

        {/* Tabs */}
        <Paper
          elevation={2}
          sx={{
            borderRadius: 2,
            backgroundColor: "grey.800",
            border: "1px solid",
            borderColor: "grey.700",
            overflow: "hidden",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                minHeight: 52,
                minWidth: 120,
                fontWeight: 600,
                textTransform: "none",
              },
            }}
          >
            <Tab icon={<PersonIcon />} label="Profile" iconPosition="start" />
            <Tab icon={<SecurityIcon />} label="Security" iconPosition="start" />
            <Tab icon={<NotificationsIcon />} label="Preferences" iconPosition="start" />
            <Tab icon={<DeleteIcon />} label="Danger Zone" iconPosition="start" />
          </Tabs>
        </Paper>

        {/* Tab Panels */}
        <Fade in={true} timeout={250}>
          <Box>
            {/* Profile Tab */}
            <TabPanel value={activeTab} index={0}>
              <Paper
                elevation={2}
                sx={{
                  p: 4,
                  borderRadius: 2,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Profile Information
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Update your personal information
                </Typography>

                {profileMessage && (
                  <Alert
                    severity={profileMessage.type}
                    sx={{ mb: 3 }}
                    onClose={() => setProfileMessage(null)}
                  >
                    {profileMessage.text}
                  </Alert>
                )}

                <GridLegacy container spacing={3}>
                  <GridLegacy item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </GridLegacy>
                  <GridLegacy item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </GridLegacy>
                  <GridLegacy item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                    />
                  </GridLegacy>
                </GridLegacy>

                <Box mt={3}>
                  <Button
                    variant="contained"
                    startIcon={isUpdatingProfile ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={handleUpdateProfile}
                    disabled={isUpdatingProfile}
                  >
                    {isUpdatingProfile ? "Saving..." : "Save Profile"}
                  </Button>
                </Box>
              </Paper>
            </TabPanel>

            {/* Security Tab */}
            <TabPanel value={activeTab} index={1}>
              <Paper
                elevation={2}
                sx={{
                  p: 4,
                  borderRadius: 2,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Change Password
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Update your password to keep your account secure
                </Typography>

                {passwordMessage && (
                  <Alert
                    severity={passwordMessage.type}
                    sx={{ mb: 3 }}
                    onClose={() => setPasswordMessage(null)}
                  >
                    {passwordMessage.text}
                  </Alert>
                )}

                <GridLegacy container spacing={3}>
                  <GridLegacy item xs={12}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            edge="end"
                          >
                            {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        ),
                      }}
                    />
                  </GridLegacy>
                  <GridLegacy item xs={12}>
                    <TextField
                      fullWidth
                      label="New Password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      helperText="Password must be at least 6 characters"
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                          >
                            {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        ),
                      }}
                    />
                  </GridLegacy>
                  <GridLegacy item xs={12}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </GridLegacy>
                </GridLegacy>

                <Box mt={3}>
                  <Button
                    variant="contained"
                    startIcon={isChangingPassword ? <CircularProgress size={20} /> : <SecurityIcon />}
                    onClick={handleChangePassword}
                    disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                  >
                    {isChangingPassword ? "Changing..." : "Change Password"}
                  </Button>
                </Box>
              </Paper>
            </TabPanel>

            {/* Preferences Tab */}
            <TabPanel value={activeTab} index={2}>
              <Paper
                elevation={2}
                sx={{
                  p: 4,
                  borderRadius: 2,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Preferences
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Customize your experience
                </Typography>

                {preferencesMessage && (
                  <Alert
                    severity={preferencesMessage.type}
                    sx={{ mb: 3 }}
                    onClose={() => setPreferencesMessage(null)}
                  >
                    {preferencesMessage.text}
                  </Alert>
                )}

                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Odds Format
                    </Typography>
                    <Box display="flex" gap={1}>
                      {["decimal", "american", "fractional"].map((format) => (
                        <Button
                          key={format}
                          variant={preferences.oddsFormat === format ? "contained" : "outlined"}
                          onClick={() =>
                            setPreferences({ ...preferences, oddsFormat: format as any })
                          }
                          size="small"
                        >
                          {format.charAt(0).toUpperCase() + format.slice(1)}
                        </Button>
                      ))}
                    </Box>
                  </CardContent>
                </Card>

                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Notifications
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.notifications.betSettled}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              notifications: {
                                ...preferences.notifications,
                                betSettled: e.target.checked,
                              },
                            })
                          }
                        />
                      }
                      label="Bet Settled"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.notifications.oddsChanged}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              notifications: {
                                ...preferences.notifications,
                                oddsChanged: e.target.checked,
                              },
                            })
                          }
                        />
                      }
                      label="Odds Changed"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.notifications.newGames}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              notifications: {
                                ...preferences.notifications,
                                newGames: e.target.checked,
                              },
                            })
                          }
                        />
                      }
                      label="New Games Available"
                    />
                  </CardContent>
                </Card>

                <Box mt={3}>
                  <Button
                    variant="contained"
                    startIcon={isSavingPreferences ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={handleSavePreferences}
                    disabled={isSavingPreferences}
                  >
                    {isSavingPreferences ? "Saving..." : "Save Preferences"}
                  </Button>
                </Box>
              </Paper>
            </TabPanel>

            {/* Danger Zone Tab */}
            <TabPanel value={activeTab} index={3}>
              <Paper
                elevation={2}
                sx={{
                  p: 4,
                  borderRadius: 2,
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  background: "linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, transparent 100%)",
                }}
              >
                <Typography variant="h6" fontWeight={600} gutterBottom color="error">
                  Danger Zone
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  These actions are irreversible. Please proceed with caution.
                </Typography>

                <Card variant="outlined" sx={{ borderColor: "error.main" }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Delete Account
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Once you delete your account, all your data will be permanently removed.
                      This action cannot be undone.
                    </Typography>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      Delete Account
                    </Button>
                  </CardContent>
                </Card>
              </Paper>
            </TabPanel>
          </Box>
        </Fade>
      </Container>

      {/* Delete Account Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: "grey.900",
            border: "1px solid rgba(239, 68, 68, 0.3)",
          },
        }}
      >
        <DialogTitle color="error">Delete Account</DialogTitle>
        <DialogContent>
          {deleteMessage && (
            <Alert severity={deleteMessage.type} sx={{ mb: 2 }}>
              {deleteMessage.text}
            </Alert>
          )}
          <Typography variant="body1" gutterBottom>
            Are you sure you want to delete your account? This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Type <strong>DELETE</strong> to confirm:
          </Typography>
          <TextField
            fullWidth
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder="Type DELETE"
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Enter your password to verify:
          </Typography>
          <TextField
            fullWidth
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Your password"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={isDeleting || deleteConfirmation !== "DELETE" || !deletePassword}
          >
            {isDeleting ? <CircularProgress size={24} /> : "Delete Account"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;
