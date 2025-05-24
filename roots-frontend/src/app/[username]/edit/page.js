'use client';

import {
  useEffect,
  useState,
} from 'react';

import Image from 'next/image';
import {
  useParams,
  useRouter,
} from 'next/navigation';
import toast from 'react-hot-toast';

export default function EditProfilePage() {
  const { username } = useParams();
  const router = useRouter();

  const [userData, setUserData] = useState(null);
  const [bio, setBio] = useState('');
  const [links, setLinks] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('graphinity_user');
    if (!storedUser) {
      router.replace('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.username !== username) {
      setUnauthorized(true);
      router.replace('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/roots/${username}`);
        const data = await res.json();
        setUserData(data);
        setBio(data.bio || '');
        setLinks(data.links || []);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load user:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, [username, router]);

  const handleLogout = () => {
    localStorage.removeItem('graphinity_user');
    toast.success('Logged out');
    router.replace('/login');
  };

  const handleSave = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/${username}/edit`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            bio,
            links: links.map(({ pendingIconFile, ...rest }) => rest), // exclude temp file
          }),
        }
      );

      const data = await res.json();
      toast.success(data.message || 'Changes saved');
    } catch (err) {
      console.error('Error saving:', err);
      toast.error('Something went wrong.');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedImage(file);
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('target', 'profile');

    setUploading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Upload failed');
        return;
      }

      toast.success('Profile photo updated!');
      setUserData((prev) => ({
        ...prev,
        profileImage: data.imageUrl,
      }));
      setSelectedImage(null);
    } catch (err) {
      toast.error('Upload error');
    } finally {
      setUploading(false);
    }
  };

  const handleIconUpload = async (index) => {
    const file = links[index]?.pendingIconFile;
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Upload failed');
        return;
      }

      toast.success('Icon uploaded');
      const updated = [...links];
      updated[index].icon = data.imageUrl;
      delete updated[index].pendingIconFile;
      setLinks(updated);
    } catch (err) {
      toast.error('Upload error');
    }
  };

  const updateLink = (index, field, value) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const addLink = () => setLinks([...links, { title: '', url: '', icon: '' }]);
  const removeLink = (i) => setLinks(links.filter((_, idx) => idx !== i));

  if (unauthorized) return null;
  if (loading) return <main className="p-6">Loading...</main>;

  return (
    <main className="min-h-screen max-w-xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Edit Profile: @{username}</h1>
        <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">
          Logout
        </button>
      </div>

      {/* ✅ Profile Image Upload */}
      <div className="mb-6">
        <label className="block font-semibold mb-1">Profile Image</label>

        {userData?.profileImage && (
          <div className="w-24 h-24 relative mb-2 rounded-full overflow-hidden">
            <Image
              src={userData.profileImage}
              alt="Profile"
              fill
              sizes="96px"
              className="object-cover rounded-full"
            />
          </div>
        )}

        <input type="file" accept="image/*" onChange={handleImageChange} className="mb-2" />

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
      </div>

      {/* Bio Input */}
      <div className="mb-6">
        <label className="block font-semibold mb-1">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      {/* Link Editor */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Links</h2>
        {links.map((link, idx) => (
          <div key={idx} className="border rounded p-3 mb-2 space-y-2">
            {link.icon && (
              <div className="w-6 h-6 relative rounded overflow-hidden">
                <Image
                  src={link.icon}
                  alt="icon"
                  fill
                  sizes="24px"
                  className="object-cover"
                />
              </div>
            )}

            <input
              type="text"
              placeholder="Icon URL"
              value={link.icon}
              onChange={(e) => updateLink(idx, 'icon', e.target.value)}
              className="w-full border rounded p-1"
            />

            <input
              type="file"
              accept="image/*"
              className="w-full text-sm"
              onChange={(e) => {
                const file = e.target.files[0];
                const updated = [...links];
                updated[idx].pendingIconFile = file;
                setLinks(updated);
              }}
            />

            <button
              onClick={() => handleIconUpload(idx)}
              disabled={!link.pendingIconFile}
              className="bg-gray-700 text-white text-sm px-3 py-1 rounded hover:bg-black disabled:opacity-40"
            >
              Upload Icon
            </button>

            <input
              type="text"
              placeholder="Title"
              value={link.title}
              onChange={(e) => updateLink(idx, 'title', e.target.value)}
              className="w-full border rounded p-1"
            />
            <input
              type="text"
              placeholder="URL"
              value={link.url}
              onChange={(e) => updateLink(idx, 'url', e.target.value)}
              className="w-full border rounded p-1"
            />

            <button
              onClick={() => removeLink(idx)}
              className="text-red-600 text-sm hover:underline"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          onClick={addLink}
          className="mt-2 bg-gray-800 text-white px-4 py-2 rounded hover:bg-black"
        >
          Add New Link
        </button>
      </div>

      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Save Changes
      </button>
    </main>
  );
}
