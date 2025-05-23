import {
  FaBell,
  FaHeart,
  FaUserCircle,
  FaMapMarkerAlt,
  FaSearch,
  FaChevronDown,
  FaSignOutAlt,
  FaUser,
  FaClipboardList,
  FaUpload,
} from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import indianCities from "../data/cities";
import axios from "axios";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const [searchTerm, setSearchTerm] = useState(params.get("search") || "");
  const [selectedCity, setSelectedCity] = useState("Bengaluru");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const bellRef = useRef(null);

  const userId = JSON.parse(localStorage.getItem("userData"))?._id;

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) setIsLoggedIn(true);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchWishlistCount = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const response = await axios.get('http://localhost:3000/wishlist', {
          headers: { 'x-access-token': token }
        });
        setWishlistCount(response.data.length);
      } catch (error) {
        console.error('Error fetching wishlist count:', error);
      }
    };

    fetchWishlistCount();
  }, [location.pathname]); // Refetch when route changes

  const fetchNotifications = async () => {
    if (!userId) return; // no userId, skip fetch
    try {
      const { data } = await axios.get(`http://localhost:3000/api/notifications/${userId}`);
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`http://localhost:3000/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === id ? { ...notif, read: true } : notif
        )
      );
      // Optional: close dropdown on click
      // setIsNotifOpen(false);
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
    setIsUserMenuOpen(false);
    navigate("/");
    window.location.reload();
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      if (searchTerm.trim()) {
        navigate(`/product?search=${encodeURIComponent(searchTerm.trim())}`);
      } else {
        navigate("/product");
      }
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim() === "") {
      navigate("/product");
    }
  };

  return (
    <header className="bg-[#0D2C85] text-white px-4 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <h1 
          className="text-3xl font-bold font-['Inknut_Antiqua'] cursor-pointer" 
          onClick={() => navigate('/')}
        >
          Equiply
        </h1>
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center space-x-1 text-sm cursor-pointer hover:text-gray-200"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <FaMapMarkerAlt />
            <span>{selectedCity}</span>
            <FaChevronDown className="text-xs" />
          </div>
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white text-black shadow-lg rounded-md py-2 z-10 max-h-60 overflow-y-auto w-48">
              {indianCities.map((city, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => {
                    setSelectedCity(city);
                    setIsDropdownOpen(false);
                  }}
                >
                  {city}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 mx-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 rounded-md text-black text-sm placeholder-gray-400 focus:outline-none"
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleSearch}
          />
        </div>
      </div>

      <div className="flex items-center space-x-4 text-white text-lg">
        {isLoggedIn && (
          <>
            <div ref={bellRef} className="relative">
              <FaBell
                className="cursor-pointer hover:text-gray-200"
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  fetchNotifications();
                }}
              />
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-black rounded-md shadow-lg z-30 max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-2 text-sm">No notifications</div>
                  ) : (
                    notifications.map((notif, index) => (
                      <div
                        key={index}
                        className={`px-4 py-2 text-sm border-b cursor-pointer hover:bg-gray-100 ${
                          !notif.read ? "bg-blue-100 font-semibold" : ""
                        }`}
                        onClick={() => markAsRead(notif._id)}
                      >
                        {notif.message}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="relative group">
              <div className="relative">
                <FaHeart 
                  className="cursor-pointer hover:text-red-400 transition-colors" 
                  onClick={() => navigate('/wishlist')}
                />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <div className="absolute right-0 mt-2 w-32 bg-white text-black text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="px-4 py-2">My Wishlist</div>
              </div>
            </div>
          </>
        )}
        {isLoggedIn ? (
          <div className="relative" ref={userMenuRef}>
            <FaUserCircle
              className="text-2xl cursor-pointer"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            />
            {isUserMenuOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white text-black shadow-lg rounded-md py-2 z-20 w-48">
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => navigate("/profile")}
                >
                  <FaUser className="mr-2 text-sm" />
                  <span>Profile</span>
                </div>
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => navigate("/History")}
                >
                  <FaClipboardList className="mr-2 text-sm" />
                  <span>Orders</span>
                </div>
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => navigate("/PutRent")}
                >
                  <FaUpload className="mr-2 text-sm" />
                  <span>Put for Rent</span>
                </div>
                <hr className="my-1" />
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center text-red-600"
                  onClick={handleSignOut}
                >
                  <FaSignOutAlt className="mr-2 text-sm" />
                  <span>Sign Out</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link to="/login" className="text-sm hover:underline">
              Login
            </Link>
            <span>/</span>
            <Link to="/Signup" className="text-sm hover:underline">
              Signup
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
