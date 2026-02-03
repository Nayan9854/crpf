import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Search, Plus, Edit, Trash2, X, ChevronDown, ChevronUp, Info, Filter, User } from "lucide-react";

const WeaponCrud = () => {
  const [weapons, setWeapons] = useState([]);
  const [form, setForm] = useState({
    Weapon_Id: "",
    name: "",
    type: "",
    description: "",
    assignedTo: "",
    isOperational: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWeapon, setSelectedWeapon] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    assignment: "all" // New filter for assignment status
  });
  const [personnelList, setPersonnelList] = useState([]); // For assigning weapons

  const fetchWeapons = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("http://localhost:5000/api/admin/weapon");
      setWeapons(res.data);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to load weapons", type: "error" });
      setIsLoading(false);
    }
  };

  const fetchPersonnel = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/personnel");
      setPersonnelList(res.data);
    } catch (err) {
      console.error("Failed to fetch personnel", err);
      toast.error("Failed to load personnel data");
    }
  };

  useEffect(() => {
    fetchWeapons();
    fetchPersonnel();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (editingId) {
        await axios.put(`http://localhost:5000/api/admin/weapon/${editingId}`, form);
        setMessage({ text: "Weapon updated successfully", type: "success" });
      } else {
        await axios.post("http://localhost:5000/api/admin/weapon", form);
        setMessage({ text: "Weapon added successfully", type: "success" });
      }
      resetForm();
      fetchWeapons();
      setShowFormModal(false);
    } catch (err) {
      console.error(err);
      setMessage({
        text: err.response?.data?.message || "Operation failed",
        type: "error",
      });
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      Weapon_Id: "",
      name: "",
      type: "",
      description: "",
      assignedTo: "",
      isOperational: true,
    });
    setEditingId(null);
    setMessage({ text: "", type: "" });
  };

  const handleEdit = (weapon) => {
    setForm({
      ...weapon,
      assignedTo: weapon.assignedTo || "" // Ensure assignedTo is set correctly
    });
    setEditingId(weapon.Weapon_Id);
    setShowFormModal(true);
    setSelectedWeapon(null);
  };

  const handleDelete = async (Weapon_Id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        setIsLoading(true);
        await axios.delete(`http://localhost:5000/api/admin/weapon/${Weapon_Id}`);
        setMessage({ text: "Weapon deleted successfully", type: "success" });
        fetchWeapons();
        if (selectedWeapon?.Weapon_Id === Weapon_Id) {
          setSelectedWeapon(null);
        }
      } catch (err) {
        console.error(err);
        setMessage({ text: "Failed to delete weapon", type: "error" });
        setIsLoading(false);
      }
    }
  };

  const clearAssignment = async (Weapon_Id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/weapon/${Weapon_Id}`, {
        assignedTo: ""
      });
      toast.success("Assignment cleared successfully");
      fetchWeapons();
      if (selectedWeapon?.Weapon_Id === Weapon_Id) {
        setSelectedWeapon({ ...selectedWeapon, assignedTo: "" });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to clear assignment");
    }
  };

  const filteredWeapons = weapons.filter((weapon) => {
    const matchesSearch =
      weapon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      weapon.Weapon_Id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      weapon.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (weapon.assignedTo && weapon.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filters.type === "all" || weapon.type === filters.type;

    const matchesStatus =
      filters.status === "all" ||
      (filters.status === "operational" && weapon.isOperational) ||
      (filters.status === "non-operational" && !weapon.isOperational);

    const matchesAssignment =
      filters.assignment === "all" ||
      (filters.assignment === "assigned" && weapon.assignedTo) ||
      (filters.assignment === "unassigned" && !weapon.assignedTo);

    return matchesSearch && matchesType && matchesStatus && matchesAssignment;
  });

  const weaponTypes = [...new Set(weapons.map((w) => w.type))].filter(Boolean).sort();

  const openAddWeaponForm = () => {
    resetForm();
    setShowFormModal(true);
  };

  const getAssignedPersonnelName = (userId) => {
    if (!userId) return "Unassigned";
    const personnel = personnelList.find(p => p.User_Id === userId);
    return personnel ? `${personnel.name} (${personnel.User_Id})` : userId;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans relative">
      {/* Floating Add Button */}
      <button
        onClick={openAddWeaponForm}
        className="fixed bottom-8 right-8 z-40 bg-gray-800 hover:bg-gray-900 text-white rounded-full p-4 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500"
      >
        <Plus className="w-8 h-8" />
      </button>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Weapon Armory <span className="text-gray-700">Command</span>
          </h1>
          <p className="text-lg text-gray-700 mt-3 max-w-2xl mx-auto">
            Streamline your inventory management with precision and advanced control.
          </p>
        </div>

        {/* Weapons List Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-800 text-white px-8 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <h2 className="text-2xl font-bold">
              Weapon Inventory <span className="text-gray-400 text-lg">({filteredWeapons.length})</span>
            </h2>

            <div className="w-full md:w-auto flex flex-col md:flex-row items-center gap-4">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by ID, name, type, or assigned user..."
                  className="w-full pl-11 pr-5 py-2.5 rounded-full text-gray-800 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:bg-white transition-all duration-200 placeholder-gray-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-full text-white flex items-center gap-2 transition-colors duration-200 shadow-sm"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Filters Section */}
          {showFilters && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weapon Type</label>
                  <div className="relative">
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 bg-white appearance-none pr-10 text-gray-800"
                    >
                      <option value="all">All Types</option>
                      {weaponTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Operational Status</label>
                  <div className="relative">
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 bg-white appearance-none pr-10 text-gray-800"
                    >
                      <option value="all">All Statuses</option>
                      <option value="operational">Operational</option>
                      <option value="non-operational">Non-Operational</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Status</label>
                  <div className="relative">
                    <select
                      value={filters.assignment}
                      onChange={(e) => setFilters({ ...filters, assignment: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 bg-white appearance-none pr-10 text-gray-800"
                    >
                      <option value="all">All</option>
                      <option value="assigned">Assigned</option>
                      <option value="unassigned">Unassigned</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-end pt-4 md:pt-0">
                  <button
                    onClick={() => {
                      setFilters({
                        type: "all",
                        status: "all",
                        assignment: "all"
                      });
                      setSearchTerm("");
                    }}
                    className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-gray-700 font-medium shadow-sm"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-500 border-t-transparent"></div>
              <p className="mt-4 text-lg text-gray-600">Loading weapon inventory...</p>
            </div>
          ) : filteredWeapons.length === 0 ? (
            <div className="p-12 text-center bg-white">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="mt-4 text-xl font-medium text-gray-900">No weapons found</h3>
              <p className="mt-2 text-gray-600">Try adjusting your search filters or add a new weapon.</p>
              <button
                onClick={openAddWeaponForm}
                className="mt-6 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" /> Add New Weapon
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
              {filteredWeapons.map((weapon) => (
                <div
                  key={weapon.Weapon_Id}
                  className="border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 bg-white group flex flex-col justify-between"
                >
                  <div className="aspect-w-4 aspect-h-3">
                    <div className="bg-gray-100 rounded-t-xl flex items-center justify-center text-gray-400 text-sm italic">
                      Weapon Image Placeholder
                    </div>
                  </div>
                  <div className={`p-5 border-b border-gray-300`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-extrabold text-xl text-gray-900 group-hover:text-gray-700 transition-colors duration-200">
                          {weapon.name}
                        </h3>
                        <p className="text-sm font-mono text-gray-500 mt-1">{weapon.Weapon_Id}</p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${weapon.isOperational ? "bg-green-200 text-green-900" : "bg-red-200 text-red-900"
                          }`}
                      >
                        {weapon.isOperational ? "Operational" : "Out of Service"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 capitalize">
                      <span className="font-medium text-gray-800">Type:</span> {weapon.type}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 flex items-center">
                      <User className="w-4 h-4 mr-1 text-gray-500" />
                      <span className="font-medium text-gray-800">Assigned to:</span> {getAssignedPersonnelName(weapon.assignedTo)}
                    </p>
                  </div>
                  <div className="p-5 flex-grow">
                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                      <span className="font-medium text-gray-800">Description: </span>
                      {weapon.description || "No description available for this weapon."}
                    </p>
                  </div>
                  <div className="border-t border-gray-200 p-4 flex justify-around gap-2 bg-gray-50">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedWeapon(weapon); }}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-1 text-sm font-medium"
                      title="View Details"
                    >
                      <Info className="w-4 h-4" /> View
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(weapon); }}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-1 text-sm font-medium"
                      title="Edit Weapon"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(weapon.Weapon_Id, weapon.name); }}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-1 text-sm font-medium"
                      title="Delete Weapon"
                    >
                      <Trash2 className="w-4 h-4" /> Del
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Weapon Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform scale-95 opacity-0 animate-scale-in">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="text-3xl font-bold text-gray-900">
                  {editingId ? "Update Weapon Details" : "Register New Weapon"}
                </h3>
                <button
                  onClick={() => {
                    setShowFormModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-800 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-7">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Weapon ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="Weapon_Id"
                      placeholder="e.g., WPN-001, AK-47-ALPHA"
                      className="w-full p-3.5 border border-gray-300 rounded-lg focus:ring-4 focus:ring-gray-400 focus:border-gray-500 transition-all duration-200 placeholder-gray-500 text-gray-800 bg-gray-50"
                      value={form.Weapon_Id}
                      onChange={handleChange}
                      required
                      disabled={!!editingId}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g., M4 Carbine, MP5 Submachine Gun"
                      className="w-full p-3.5 border border-gray-300 rounded-lg focus:ring-4 focus:ring-gray-400 focus:border-gray-500 transition-all duration-200 placeholder-gray-500 text-gray-800 bg-gray-50"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="type"
                        className="w-full p-3.5 border border-gray-300 rounded-lg focus:ring-4 focus:ring-gray-400 focus:border-gray-500 transition-all duration-200 text-gray-800 bg-gray-50 appearance-none pr-10"
                        value={form.type}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled className="text-gray-400">
                          Select Type
                        </option>
                        {weaponTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                        <option value="Other">Other</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Assign to Personnel
                    </label>
                    <div className="relative">
                      <select
                        name="assignedTo"
                        className="w-full p-3.5 border border-gray-300 rounded-lg focus:ring-4 focus:ring-gray-400 focus:border-gray-500 transition-all duration-200 text-gray-800 bg-gray-50 appearance-none pr-10"
                        value={form.assignedTo}
                        onChange={handleChange}
                      >
                        <option value="">Unassigned</option>
                        {personnelList.map((person) => (
                          <option key={person.User_Id} value={person.User_Id}>
                            {person.name} ({person.User_Id})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex items-center pt-2">
                    <input
                      type="checkbox"
                      name="isOperational"
                      id="isOperational"
                      className="h-5 w-5 text-gray-700 rounded-md focus:ring-gray-500 border-gray-300 cursor-pointer"
                      checked={form.isOperational}
                      onChange={handleChange}
                    />
                    <label htmlFor="isOperational" className="ml-3 text-base text-gray-800 font-medium cursor-pointer">
                      Operational Status
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    placeholder="Provide a detailed description of the weapon, including its purpose, features, and any unique characteristics..."
                    rows={4}
                    className="w-full p-3.5 border border-gray-300 rounded-lg focus:ring-4 focus:ring-gray-400 focus:border-gray-500 transition-all duration-200 placeholder-gray-500 text-gray-800 bg-gray-50 resize-y"
                    value={form.description}
                    onChange={handleChange}
                  />
                </div>

                {message.text && (
                  <div
                    className={`px-6 py-4 text-center text-sm font-medium ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      } rounded-lg`}
                  >
                    {message.text}
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowFormModal(false);
                      resetForm();
                    }}
                    className="px-8 py-3 rounded-lg text-gray-700 font-semibold border border-gray-300 hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-8 py-3 rounded-lg text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-gray-700 hover:bg-gray-800 active:bg-gray-900 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-gray-500"
                      }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : editingId ? (
                      <>
                        <Edit className="w-5 h-5" /> Update Weapon
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" /> Add Weapon
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Weapon Detail Modal */}
      {selectedWeapon && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform scale-95 opacity-0 animate-scale-in">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="text-3xl font-bold text-gray-900">Weapon Details</h3>
                <button
                  onClick={() => setSelectedWeapon(null)}
                  className="text-gray-500 hover:text-gray-800 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Weapon ID</label>
                    <div className="p-3 bg-gray-100 text-gray-800 rounded-lg font-mono text-lg break-all">{selectedWeapon.Weapon_Id}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                    <div className="p-3 bg-gray-100 text-gray-900 rounded-lg font-semibold text-lg">{selectedWeapon.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                    <div className="p-3 bg-gray-100 text-gray-700 rounded-lg text-lg capitalize">{selectedWeapon.type}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <div className={`p-3 rounded-lg font-semibold text-lg ${selectedWeapon.isOperational ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                      {selectedWeapon.isOperational ? "Operational" : "Out of Service"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Assigned To</label>
                    <div className="p-3 bg-gray-100 text-gray-700 rounded-lg text-lg flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-500" />
                      {getAssignedPersonnelName(selectedWeapon.assignedTo)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Assignment</label>
                    <button
                      onClick={() => {
                        handleEdit(selectedWeapon);
                        setSelectedWeapon(null);
                      }}
                      className="w-full p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-lg transition-colors duration-200"
                    >
                      Change Assignment
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <div className="p-4 bg-gray-100 rounded-lg min-h-[100px] text-gray-700 leading-relaxed text-base overflow-y-auto max-h-48">
                    {selectedWeapon.description || "No description available for this weapon."}
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6">
                  <button
                    onClick={() => {
                      handleEdit(selectedWeapon);
                      setSelectedWeapon(null);
                    }}
                    className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 flex items-center gap-2 font-medium shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-gray-500"
                  >
                    <Edit className="w-5 h-5" /> Edit Weapon
                  </button>
                  <button
                    onClick={() => handleDelete(selectedWeapon.Weapon_Id, selectedWeapon.name)}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2 font-medium shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-red-300"
                  >
                    <Trash2 className="w-5 h-5" /> Delete Weapon
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeaponCrud;