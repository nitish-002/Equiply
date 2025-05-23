import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../header";
import Footer from "../Footer";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import axios from "axios";

const Product = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const searchTerm = params.get("search") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:3000/product");
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : data.products || data.data || data.items || []);
        setLoading(false);
      } catch (err) {
        setError("Failed to load products");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      try {
        const response = await axios.get('http://localhost:3000/wishlist', {
          headers: { 'x-access-token': token }
        });
        setWishlistItems(response.data);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    };

    fetchWishlist();
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleWishlistClick = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const isInWishlist = wishlistItems.some(item => item.id === productId);
      
      if (isInWishlist) {
        await axios.delete(`http://localhost:3000/wishlist/remove/${productId}`, {
          headers: { 'x-access-token': token }
        });
        setWishlistItems(wishlistItems.filter(item => item.id !== productId));
      } else {
        await axios.post('http://localhost:3000/wishlist/add', 
          { productId },
          { headers: { 'x-access-token': token } }
        );
        setWishlistItems([...wishlistItems, { id: productId }]);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        navigate('/login');
      }
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.includes(product.category);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex flex-col lg:flex-row p-6 gap-6 flex-grow">
        <aside className="w-full lg:w-1/5 space-y-4">
          <h2 className="font-semibold text-lg">Filter by Category</h2>
          {["Mobile", "Electronics", "House Appliances", "Accessories"].map((cat) => (
            <label key={cat} className="block text-sm">
              <input
                type="checkbox"
                className="mr-2"
                checked={selectedCategories.includes(cat)}
                onChange={() => handleCategoryChange(cat)}
              />
              {cat}
            </label>
          ))}
        </aside>

        <main className="flex-1">
          {loading ? (
            <div className="text-center py-20 text-lg font-medium">Loading products...</div>
          ) : error ? (
            <div className="text-center py-20 text-lg font-medium text-red-600">{error}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-lg font-medium">No products found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const isInWishlist = wishlistItems.some(item => item.id === product._id);
                return (
                  <Link
                    to={`/productveiw/${product._id || product.id}`}
                    key={product._id || product.id}
                    className="border rounded-lg p-4 flex flex-col items-center text-center hover:shadow-lg transition-shadow relative no-underline text-inherit"
                  >
                    <button
                      className={`absolute top-2 right-2 p-1 rounded-full bg-white hover:bg-gray-100 transition-colors ${
                        isInWishlist ? 'text-red-500' : 'text-gray-400'
                      }`}
                      onClick={(e) => handleWishlistClick(e, product._id)}
                      title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart size={18} fill={isInWishlist ? 'currentColor' : 'none'} />
                    </button>
                    <img
                      src={product.images || "https://via.placeholder.com/150"}
                      alt={product.name}
                      className="w-28 h-28 object-contain mb-4"
                    />
                    <h3 className="text-sm font-medium mb-2 text-black">{product.name}</h3>
                    <p className="text-lg font-bold mb-2 text-black">₹{product.price}</p>
                    <button className="bg-black text-white px-4 py-2 text-sm rounded hover:bg-gray-800" onClick={(e) => e.preventDefault()}>
                      Rent Now
                    </button>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Product;
