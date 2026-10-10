import { useState } from "react";
import {
  PhotoIcon,
  UserCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";

const compressImage = (file, maxWidth = 800, quality = 0.7) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Could not read image"));

    reader.onload = () => {
      const img = new Image();

      img.onerror = () => reject(new Error("Invalid image"));

      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Canvas not supported"));
          return;
        }

        context.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  });

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  span = "sm:col-span-3",
}) {
  return (
    <div className={span}>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 block w-full border-b border-line bg-transparent py-2 focus:outline-none focus:border-pine"
      />
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}

const HOBBIES = ["Reading", "Writing", "Surfing", "Travelling", "Music"];

const STORAGE_KEY = "Users";

const USERS_PER_PAGE = 5;

export default function Form() {
  const [username, setUsername] = useState("");
  const [about, setAbout] = useState("");
  const [photo, setPhoto] = useState("");
  const [coverPhoto, setCoverPhoto] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [hobby, setHobby] = useState([]);
  const [country, setCountry] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");

  const [errors, setErrors] = useState({});

  const [editId, setEditId] = useState(null);

  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const searchValue = search.trim().toLowerCase();
  const filteredUsers = users.filter((u) =>
    [
      u.username,
      u.firstName,
      u.lastName,
      u.email,
      u.gender,
      u.country,
      u.city,
      u.state,
    ].some((field) => String(field).toLowerCase().includes(searchValue))
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const valueA = a[sortField];
    const valueB = b[sortField];

    const result =
      typeof valueA === "number"
        ? valueA - valueB
        : String(valueA).localeCompare(String(valueB), undefined, {
            sensitivity: "base",
          });

    return sortOrder === "asc" ? result : -result;
  });

  const totalPages = Math.ceil(sortedUsers.length / USERS_PER_PAGE);
  const activePage = Math.min(currentPage, Math.max(totalPages, 1));
  const startIndex = (activePage - 1) * USERS_PER_PAGE;
  const paginatedUsers = sortedUsers.slice(
    startIndex,
    startIndex + USERS_PER_PAGE
  );

  const setError = (field, message) =>
    setErrors((prev) => ({ ...prev, [field]: message }));

  const clearError = (field) =>
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });

  const handleImage = async (e, field, setter, maxWidth) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(field, "Please upload a valid image file!");
      return;
    }

    try {
      setter(await compressImage(file, maxWidth));
      clearError(field);
    } catch {
      setError(field, "Unable to process image!");
    }
  };

  const handleEdit = (user) => {
    setEditId(user.id);
    setUsername(user.username);
    setAbout(user.about);
    setPhoto(user.photo ?? "");
    setCoverPhoto(user.coverPhoto ?? "");
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setPassword(user.password);
    setGender(user.gender);
    setHobby(user.hobby ?? []);
    setCountry(user.country);
    setStreetAddress(user.streetAddress);
    setCity(user.city);
    setState(user.state);
    setPinCode(user.pinCode);
    setErrors({});

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    const updatedUsers = users.filter((u) => u.id !== id);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      alert("User Deleted Successfully!");
    } catch (error) {
      console.error("LocalStorage error:", error);
      alert("Unable to update local storage.");
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleHobby = (value) => {
    setHobby((prev) =>
      prev.includes(value) ? prev.filter((h) => h !== value) : [...prev, value]
    );
  };

  const resetForm = () => {
    setUsername("");
    setAbout("");
    setPhoto("");
    setCoverPhoto("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setGender("");
    setHobby([]);
    setCountry("");
    setStreetAddress("");
    setCity("");
    setState("");
    setPinCode("");
    setErrors({});
    setEditId(null);

    const photoInput = document.getElementById("photo-upload");
    const coverInput = document.getElementById("file-upload");
    if (photoInput) photoInput.value = "";
    if (coverInput) coverInput.value = "";
  };

  const validate = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = "Username is required!";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters!";
    } else if (username.length > 20) {
      newErrors.username = "Username must not exceed 20 characters!";
    } else if (!/^[A-Za-z0-9_]+$/.test(username)) {
      newErrors.username =
        "Username can contain only letters, numbers and underscore!";
    }

    if (!about.trim()) {
      newErrors.about = "About is required!";
    } else if (about.trim().length < 30) {
      newErrors.about = "About must be at least 30 characters!";
    } else if (about.trim().length > 200) {
      newErrors.about = "About must not exceed 200 characters!";
    }

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required!";
    } else if (!/^[A-Za-z ]+$/.test(firstName)) {
      newErrors.firstName = "First name can contain only letters!";
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters!";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required!";
    } else if (!/^[A-Za-z ]+$/.test(lastName)) {
      newErrors.lastName = "Last name can contain only letters!";
    } else if (lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters!";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required!";
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      newErrors.email = "Please enter a valid email address!";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required!";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters!";
    } else if (password.length > 16) {
      newErrors.password = "Password must not exceed 16 characters!";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Password needs at least one uppercase letter!";
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = "Password needs at least one lowercase letter!";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Password needs at least one number!";
    } else if (!/[!@#$%^&*_.-]/.test(password)) {
      newErrors.password = "Password needs at least one special character!";
    }

    if (!gender) newErrors.gender = "Please select a gender!";
    if (hobby.length === 0) newErrors.hobby = "Please select at least one hobby!";
    if (!country) newErrors.country = "Please select a country!";

    if (!streetAddress.trim()) {
      newErrors.streetAddress = "Street address is required!";
    } else if (streetAddress.trim().length < 5) {
      newErrors.streetAddress = "Street address must be at least 5 characters!";
    }

    if (!city.trim()) {
      newErrors.city = "City is required!";
    } else if (!/^[A-Za-z ]+$/.test(city)) {
      newErrors.city = "City can contain only letters and spaces!";
    }

    if (!state.trim()) {
      newErrors.state = "State is required!";
    } else if (!/^[A-Za-z ]+$/.test(state)) {
      newErrors.state = "State can contain only letters and spaces!";
    }

    if (!pinCode.trim()) {
      newErrors.pinCode = "PIN code is required!";
    } else if (!/^\d{6}$/.test(pinCode)) {
      newErrors.pinCode = "Please enter a valid 6-digit PIN code!";
    }

    if (!photo) newErrors.photo = "Please upload a profile photo!";
    if (!coverPhoto) newErrors.coverPhoto = "Please upload a cover photo!";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    const formData = {
      username: username.trim(),
      about: about.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,
      gender,
      hobby: [...hobby],
      country,
      streetAddress: streetAddress.trim(),
      city: city.trim(),
      state: state.trim(),
      pinCode: pinCode.trim(),
      photo,
      coverPhoto,
    };

    const isEditing = editId !== null;

    const updatedUsers = isEditing
      ? users.map((u) => (u.id === editId ? { ...u, ...formData } : u))
      : [...users, { id: Date.now(), ...formData }];

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      alert(
        isEditing ? "User Updated Successfully!" : "User Added Successfully!"
      );

      resetForm();
      if (!isEditing) setCurrentPage(1);
    } catch (error) {
      console.error("LocalStorage error:", error);
      alert("Unable to save user. Local storage may be full.");
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-card border border-line px-8 py-10 sm:px-12 sm:py-12"
        >
          <div className="space-y-14">
            <div className="border-b border-line pb-10">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">Profile</h2>
              <p className="mt-2 text-sm text-muted">
                This information will be displayed publicly so be careful what
                you share.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-ink"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="janesmith"
                    className="mt-2 block w-full border-b border-line bg-transparent py-2 text-base text-ink focus:outline-none focus:border-pine sm:text-sm"
                  />
                  {errors.username && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {errors.username}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="about"
                    className="block text-sm font-medium text-ink"
                  >
                    About
                  </label>
                  <textarea
                    id="about"
                    rows={3}
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="Write a few sentences about yourself."
                    className="mt-2 block w-full rounded-lg border border-line bg-card px-3 py-2 text-base text-ink focus:outline-none focus:border-pine sm:text-sm"
                  />
                  {errors.about && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {errors.about}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <span className="block text-sm font-medium text-ink">
                    Photo
                  </span>

                  <div className="mt-2 flex items-center gap-x-3">
                    {photo ? (
                      <img
                        src={photo}
                        alt="Profile preview"
                        className="size-12 rounded-full object-cover border border-line"
                      />
                    ) : (
                      <UserCircleIcon className="size-12 text-pine/30" />
                    )}

                    <label
                      htmlFor="photo-upload"
                      className="cursor-pointer rounded-full border border-pine px-4 py-2 text-sm font-medium text-ink hover:bg-pine hover:text-white"
                    >
                      {photo ? "Change" : "Upload"}
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) =>
                          handleImage(e, "photo", setPhoto, 500)
                        }
                      />
                    </label>
                  </div>

                  {errors.photo && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {errors.photo}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <span className="block text-sm font-medium text-ink">
                    Cover photo
                  </span>

                  <label
                    htmlFor="file-upload"
                    className="mt-2 flex cursor-pointer justify-center rounded-lg border border-dashed border-line bg-card px-6 py-10"
                  >
                    {coverPhoto ? (
                      <div className="w-full text-center">
                        <img
                          src={coverPhoto}
                          alt="Cover preview"
                          className="mx-auto max-h-32 rounded-lg object-cover"
                        />
                        <p className="mt-3 text-sm font-semibold text-pine">
                          Change cover photo
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <PhotoIcon className="mx-auto size-12 text-pine/30" />
                        <div className="mt-4 text-sm text-muted">
                          <span className="font-semibold text-pine">
                            Upload a file
                          </span>
                        </div>
                        <p className="text-xs text-muted mt-1">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    )}

                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) =>
                        handleImage(e, "coverPhoto", setCoverPhoto, 800)
                      }
                    />
                  </label>

                  {errors.coverPhoto && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {errors.coverPhoto}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-b border-line pb-10">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
                Personal Information
              </h2>

              <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-6">
                <TextField
                  id="firstName"
                  label="First name"
                  value={firstName}
                  onChange={setFirstName}
                  error={errors.firstName}
                />

                <TextField
                  id="lastName"
                  label="Last name"
                  value={lastName}
                  onChange={setLastName}
                  error={errors.lastName}
                />

                <TextField
                  id="email"
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  error={errors.email}
                />

                <TextField
                  id="password"
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  error={errors.password}
                />

                <div className="sm:col-span-3">
                  <span className="block text-sm font-medium text-ink">
                    Gender
                  </span>

                  <div className="mt-3 flex gap-6">
                    {["Male", "Female"].map((option) => (
                      <label key={option} className="text-sm">
                        <input
                          type="radio"
                          name="gender"
                          value={option}
                          checked={gender === option}
                          onChange={(e) => setGender(e.target.value)}
                        />
                        <span className="ml-2">{option}</span>
                      </label>
                    ))}
                  </div>

                  {errors.gender && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {errors.gender}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <span className="block text-sm font-medium text-ink">
                    Hobby
                  </span>

                  <div className="mt-3 flex flex-wrap gap-4">
                    {HOBBIES.map((item) => (
                      <label key={item} className="text-sm">
                        <input
                          type="checkbox"
                          value={item}
                          checked={hobby.includes(item)}
                          onChange={() => handleHobby(item)}
                        />
                        <span className="ml-2">{item}</span>
                      </label>
                    ))}
                  </div>

                  {errors.hobby && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {errors.hobby}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-ink"
                  >
                    Country
                  </label>
                  <select
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="mt-2 w-full border-b border-line bg-transparent py-2 focus:outline-none"
                  >
                    <option value="">Select Country</option>
                    <option value="India">India</option>
                    <option value="USA">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="China">China</option>
                    <option value="Russia">Russia</option>
                    <option value="Mexico">Mexico</option>
                  </select>
                  {errors.country && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {errors.country}
                    </p>
                  )}
                </div>

                <TextField
                  id="streetAddress"
                  label="Street address"
                  value={streetAddress}
                  onChange={setStreetAddress}
                  error={errors.streetAddress}
                />

                <TextField
                  id="city"
                  label="City"
                  value={city}
                  onChange={setCity}
                  error={errors.city}
                  span="sm:col-span-2"
                />

                <TextField
                  id="state"
                  label="State / Province"
                  value={state}
                  onChange={setState}
                  error={errors.state}
                  span="sm:col-span-2"
                />

                <TextField
                  id="pinCode"
                  label="ZIP / Postal code"
                  value={pinCode}
                  onChange={setPinCode}
                  error={errors.pinCode}
                  span="sm:col-span-2"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-x-4 pt-6">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-pine px-5 py-2.5 text-sm font-medium text-ink hover:bg-pine hover:text-white"
            >
              Reset
            </button>

            <button
              type="submit"
              className="rounded-full bg-pine px-5 py-2.5 text-sm font-medium text-white hover:bg-pine-dark"
            >
              {editId === null ? "Add User" : "Update User"}
            </button>
          </div>
        </form>
      </div>

      <section className="mx-auto mb-20 mt-4 max-w-6xl px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
              Users Data
            </h2>
            <p className="mt-1 text-sm text-muted">
              {filteredUsers.length} Users found
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                aria-label="Search users"
                placeholder="Search Users..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-full border border-line bg-card py-2 pl-10 pr-4 text-sm text-ink placeholder:text-muted focus:border-pine focus:outline-none sm:w-64"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Sort by</span>
              <div
                role="group"
                aria-label="Sort users"
                className="inline-flex rounded-full border border-line bg-card p-1"
              >
                {[
                  { field: "username", label: "Username" },
                  { field: "firstName", label: "Name" },
                  { field: "id", label: "ID" },
                ].map(({ field, label }) => {
                  const active = sortField === field;

                  return (
                    <button
                      key={field}
                      type="button"
                      aria-pressed={active}
                      onClick={() => handleSort(field)}
                      className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                        active
                          ? "bg-pine text-white"
                          : "text-muted hover:text-ink"
                      }`}
                    >
                      {label} {active && (sortOrder === "asc" ? "↑" : "↓")}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-card">
          {paginatedUsers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="font-display text-lg font-semibold text-ink">
                No users found
              </p>
              <p className="mt-1 text-sm text-muted">
                {users.length === 0
                  ? "Fill in the form above and select Add User to create the first record."
                  : "Try a different search."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[56rem] border-collapse text-sm text-ink">
                <thead>
                  <tr className="bg-pine-dark text-left text-xs text-mint">
                    <th className="px-5 py-3.5 font-medium">ID</th>
                    <th className="px-5 py-3.5 font-medium">User</th>
                    <th className="px-5 py-3.5 font-medium">Email</th>
                    <th className="px-5 py-3.5 font-medium">Gender</th>
                    <th className="px-5 py-3.5 font-medium">Hobbies</th>
                    <th className="px-5 py-3.5 font-medium">Address</th>
                    <th className="px-5 py-3.5 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="border-t border-line transition-colors hover:bg-paper"
                    >
                      <td className="px-5 py-4 text-xs tabular-nums text-muted">
                        {u.id}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {u.photo ? (
                            <img
                              src={u.photo}
                              alt={u.username}
                              className="size-11 rounded-full object-cover ring-2 ring-mint"
                            />
                          ) : (
                            <UserCircleIcon className="size-11 text-pine/30" />
                          )}

                          <div>
                            <p className="font-display text-[0.95rem] font-semibold leading-tight">
                              {u.firstName} {u.lastName}
                            </p>
                            <p className="mt-0.5 text-xs text-muted">
                              @{u.username}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-muted [overflow-wrap:anywhere]">
                        {u.email}
                      </td>

                      <td className="px-5 py-4">{u.gender}</td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {u.hobby?.map((h) => (
                            <span
                              key={h}
                              className="rounded-full bg-mint px-2.5 py-0.5 text-xs font-medium text-pine-dark"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p>{u.streetAddress}</p>
                        <p className="mt-0.5 text-xs text-muted">
                          {u.city}, {u.state}, {u.country} - {u.pinCode}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(u)}
                            aria-label={`Edit ${u.username}`}
                            title="Edit"
                            className="rounded-full p-2 text-pine transition-colors hover:bg-mint"
                          >
                            <PencilSquareIcon className="size-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(u.id)}
                            aria-label={`Delete ${u.username}`}
                            title="Delete"
                            className="rounded-full p-2 text-red-700 transition-colors hover:bg-red-50"
                          >
                            <TrashIcon className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted">
            Showing {sortedUsers.length === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(startIndex + USERS_PER_PAGE, sortedUsers.length)} of{" "}
            {sortedUsers.length} Users
          </p>

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <button
              type="button"
              disabled={activePage === 1}
              onClick={() => setCurrentPage(activePage - 1)}
              className="rounded-full border border-line bg-card px-4 py-2 text-sm text-ink transition-colors hover:border-pine disabled:opacity-40 disabled:hover:border-line"
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  aria-current={page === activePage ? "page" : undefined}
                  onClick={() => setCurrentPage(page)}
                  className={`size-9 rounded-full text-sm tabular-nums transition-colors ${
                    page === activePage
                      ? "bg-pine text-white"
                      : "text-ink hover:bg-mint"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              type="button"
              disabled={activePage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(activePage + 1)}
              className="rounded-full border border-line bg-card px-4 py-2 text-sm text-ink transition-colors hover:border-pine disabled:opacity-40 disabled:hover:border-line"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}