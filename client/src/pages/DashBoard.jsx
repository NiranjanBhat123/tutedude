import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText, Avatar,
  Typography, Button, TextField, IconButton, Divider, Box, CircularProgress,
  Container, Paper, Tabs, Tab, Autocomplete, Card, CardContent, CardActions, Snackbar,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
});

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [topUsers, setTopUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [sentRequests, setSentRequests] = useState([]);
  const navigate = useNavigate()


  useEffect(() => {
    fetchDashboardData();
    fetchTopUsers();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const currentUser = JSON.parse(localStorage.getItem('user'))
      const userId = currentUser._id;
      if (!userId) {
        throw new Error('User ID not found in localStorage');
      }
      const response = await axios.post("http://localhost:5000/api/users/dashboard", { userId });
      setUser(response.data);
      setEditedUser(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      setIsLoading(false);
    }
  };

  const fetchTopUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/top');
      setTopUsers(response.data);
    } catch (error) {
      console.error('Error fetching top users:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user'))
      const userId = currentUser._id;
      const response = await axios.put(`http://localhost:5000/api/users/update/${userId}`, editedUser);
      setUser(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user profile:', error);
      setError('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleUserSelect = (event, newValue) => {
    setSelectedUser(newValue);
  };

  const handleSendFriendRequest = async () => {
    if (!selectedUser) return;

    try {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const response = await axios.post('http://localhost:5000/api/users/send-friend-request', {
        userId: currentUser._id,
        friendId: selectedUser._id
      });
      console.log('Friend request sent:', response.data);
      setSentRequests([...sentRequests, selectedUser._id]);
      toast.success('Friend request sent successfully');

    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');

    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/users/logout');
      localStorage.clear();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error(error.message);
    }
  };


  const handleFriendRequest = async (requester, accept) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const responseId = await axios.get(`http://localhost:5000/api/users/getuser/${requester}`)
      const requesterId = responseId.data[0]._id;
      const response = await axios.post('http://localhost:5000/api/users/handle-friend-request', {
        userId: currentUser._id,
        requesterId,
        accept
      });

      setUser(response.data.updatedUser);
      toast.success(accept ? 'Friend request accepted' : 'Friend request rejected');


      fetchDashboardData();
    } catch (error) {
      console.error('Error handling friend request:', error);
      toast.error('Failed to handle friend request');
    }
  };


  const renderMainContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Profile</Typography>
            {isEditing ? (
              <Box>
                <TextField
                  fullWidth
                  name="username"
                  label="Username"
                  value={editedUser.username}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  name="gender"
                  label="Gender"
                  value={editedUser.gender}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  name="DOB"
                  label="Date of Birth"
                  type="date"
                  value={editedUser.DOB.split('T')[0]}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    sx={{ mr: 1 }}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <Typography><strong>Username:</strong> {user.username}</Typography>
                <Typography><strong>Gender:</strong> {user.gender}</Typography>
                <Typography><strong>Date of Birth:</strong> {new Date(user.DOB).toLocaleDateString()}</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  sx={{ mt: 2 }}
                >
                  Edit Profile
                </Button>
              </Box>
            )}
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Friends</Typography>
            {user.friends.length > 0 ? (
              <List>
                {user.friends.map((friend) => (
                  <ListItem key={friend}>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText primary={friend} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography>No friends yet</Typography>
            )}
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Friend Requests</Typography>
            {user.friendRequests.length > 0 ? (
              <List>
                {user.friendRequests.map((request) => (
                  <ListItem key={request}>
                    <ListItemIcon>
                      <PersonAddIcon />
                    </ListItemIcon>
                    <ListItemText primary={request} />
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => handleFriendRequest(request, true)}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={() => handleFriendRequest(request, false)}
                    >
                      Reject
                    </Button>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography>No friend requests</Typography>
            )}
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Search Users</Typography>
            <Autocomplete
              options={topUsers}
              getOptionLabel={(option) => option.username}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search users"
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <SearchIcon color="action" />,
                  }}
                />
              )}
              onChange={handleUserSelect}
            />
            {selectedUser && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6">{selectedUser.username}</Typography>
                  <Typography><strong>Gender:</strong> {selectedUser.gender}</Typography>
                  <Typography><strong>Date of Birth:</strong> {new Date(selectedUser.DOB).toLocaleDateString()}</Typography>
                </CardContent>
                <CardActions>
                  {sentRequests.includes(selectedUser._id) ? (
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<AccessTimeIcon />}
                      disabled
                    >
                      Request Sent 🕒
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<PersonAddIcon />}
                      onClick={handleSendFriendRequest}
                    >
                      Send Friend Request
                    </Button>
                  )}
                </CardActions>
              </Card>
            )}
          </Box>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ThemeProvider theme={theme}>

      <Box sx={{ display: 'flex' }}>
        <Drawer
          variant="permanent"
          sx={{
            width: 280,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
              color: 'text.primary',
            },
          }}
        >
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>weConnect</Typography>
          </Box>
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              src="/dp.svg"
              sx={{ width: 100, height: 100, mb: 2, boxShadow: 3 }}
            />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{user.username}</Typography>
          </Box>
          <Divider />
          <List>
            {['Profile', 'Friends', 'Friend Requests', 'Search', 'Logout'].map((text, index) => (
              <ListItem
                button
                key={text}
                selected={activeTab === index}
                onClick={() => {
                  setActiveTab(index);
                  if (text === 'Logout') {
                    handleLogout();
                  }
                  
                }}
              >
                <ListItemIcon>
                  {index === 0 ? <PersonIcon /> :
                    index === 1 ? <GroupIcon /> :
                      index === 2 ? <PersonAddIcon /> :
                        index === 3 ? <SearchIcon /> :
                          <LogoutIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 3 }}>
              {renderMainContent()}
            </Paper>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;