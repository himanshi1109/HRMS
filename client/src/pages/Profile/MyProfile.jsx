import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { essService } from '../../services/essService';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import { Spinner } from '../../components/common/Loader';
import { formatDate } from '../../utils/formatters';
import { useForm } from 'react-hook-form';
import {
  Briefcase,
  Mail,
  Phone,
  User,
  Calendar,
  Lock,
  Building,
  Key,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const MyProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await essService.getDashboard();
      if (response?.success && response?.data?.profile) {
        setProfile(response.data.profile);
      } else {
        // Fallback mock using auth context user info
        setProfile({
          employeeId: user?.employeeId || 'EMP-1234',
          personal: {
            firstName: user?.name?.split(' ')[0] || 'User',
            lastName: user?.name?.split(' ')[1] || '',
            email: user?.email || '',
            phone: '9876543210',
            gender: 'MALE',
            dateOfBirth: '1995-04-12',
          },
          employment: {
            departmentName: 'Engineering',
            designationName: 'Senior Specialist',
            locationName: 'HQ Office',
            dateOfJoining: '2022-01-15',
          },
        });
      }
    } catch (err) {
      console.error('Failed to load profile details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onUpdateProfile = async (formData) => {
    setLoading(true);
    try {
      const payload = {
        personal: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
        },
      };

      const response = await essService.updateProfile(payload);
      if (response?.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        await loadProfile();
        // Update global user name if changed
        updateUserProfile({ name: `${formData.firstName} ${formData.lastName}` });
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Spinner size="lg" />
      </div>
    );
  }

  const fullName = `${profile?.personal?.firstName} ${profile?.personal?.lastName}`;

  return (
    <div className="space-y-6 max-w-4xl select-none">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-stardust-text">My Profile</h2>
        <p className="text-sm text-grey-text mt-1">Manage personal parameters and credentials</p>
      </div>

      {/* Header card */}
      <div className="bg-charcoal-sidebar border border-indigo-border rounded-xl p-6 shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
          <Avatar name={fullName} size="xl" />
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h3 className="text-2xl font-bold text-stardust-text">{fullName}</h3>
              <Badge status="ACTIVE" />
            </div>
            <p className="text-sm text-grey-text font-medium uppercase tracking-wide">
              {profile?.employment?.designationName}
            </p>
            <p className="text-xs text-grey-text">
              ID: <span className="font-semibold text-stardust-text">{profile?.employeeId}</span>
            </p>
          </div>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-brand hover:bg-indigo-hover text-stardust-text shadow-lg transition-all cursor-pointer"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Form Card */}
      <div className="bg-charcoal-sidebar border border-indigo-border rounded-xl p-6 shadow-lg">
        {isEditing ? (
          <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-5">
            <h3 className="text-xs font-bold text-grey-text uppercase tracking-wider border-b border-indigo-border/30 pb-2 mb-4">
              Edit personal details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-grey-text block">First Name</label>
                <input
                  {...register('firstName', { required: 'First name is required' })}
                  defaultValue={profile?.personal?.firstName}
                  type="text"
                  className="w-full px-3.5 py-2 rounded-lg bg-charcoal-navbar border border-indigo-border text-sm text-stardust-text focus:outline-none focus:border-indigo-brand transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-grey-text block">Last Name</label>
                <input
                  {...register('lastName', { required: 'Last name is required' })}
                  defaultValue={profile?.personal?.lastName}
                  type="text"
                  className="w-full px-3.5 py-2 rounded-lg bg-charcoal-navbar border border-indigo-border text-sm text-stardust-text focus:outline-none focus:border-indigo-brand transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-grey-text block">Phone</label>
                <input
                  {...register('phone')}
                  defaultValue={profile?.personal?.phone}
                  type="text"
                  className="w-full px-3.5 py-2 rounded-lg bg-charcoal-navbar border border-indigo-border text-sm text-stardust-text focus:outline-none focus:border-indigo-brand transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-grey-text block">Gender</label>
                <select
                  {...register('gender')}
                  defaultValue={profile?.personal?.gender}
                  className="w-full px-3.5 py-2 rounded-lg bg-charcoal-navbar border border-indigo-border text-sm text-stardust-text focus:outline-none focus:border-indigo-brand transition-colors"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-grey-text block">Date of Birth</label>
                <input
                  {...register('dateOfBirth')}
                  defaultValue={profile?.personal?.dateOfBirth?.split('T')[0]}
                  type="date"
                  className="w-full px-3.5 py-2 rounded-lg bg-charcoal-navbar border border-indigo-border text-sm text-stardust-text focus:outline-none focus:border-indigo-brand transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-indigo-border/30 pt-4 mt-6">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold border border-indigo-border text-stardust-text hover:bg-charcoal-navbar transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg text-xs font-semibold bg-indigo-brand hover:bg-indigo-hover text-stardust-text shadow-lg shadow-indigo-brand/20 transition-all cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          /* View mode details */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-grey-text uppercase tracking-wider border-b border-indigo-border/30 pb-2">
                Personal Info
              </h3>
              <div className="space-y-3.5">
                <div className="flex justify-between border-b border-indigo-border/20 pb-1.5">
                  <span className="text-grey-text flex items-center gap-2"><User size={14} /> Full Name</span>
                  <span className="font-semibold text-stardust-text">{fullName}</span>
                </div>
                <div className="flex justify-between border-b border-indigo-border/20 pb-1.5">
                  <span className="text-grey-text flex items-center gap-2"><Mail size={14} /> Work Email</span>
                  <span className="font-semibold text-stardust-text">{profile?.contact?.officialEmail || profile?.personal?.email}</span>
                </div>
                <div className="flex justify-between border-b border-indigo-border/20 pb-1.5">
                  <span className="text-grey-text flex items-center gap-2"><Phone size={14} /> Mobile Phone</span>
                  <span className="font-semibold text-stardust-text">{profile?.contact?.personalPhone || profile?.personal?.phone || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-grey-text flex items-center gap-2"><Calendar size={14} /> Birthdate</span>
                  <span className="font-semibold text-stardust-text">{formatDate(profile?.personal?.dateOfBirth)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-grey-text uppercase tracking-wider border-b border-indigo-border/30 pb-2">
                Deployment Settings
              </h3>
              <div className="space-y-3.5">
                <div className="flex justify-between border-b border-indigo-border/20 pb-1.5">
                  <span className="text-grey-text flex items-center gap-2"><Building size={14} /> Department</span>
                  <span className="font-semibold text-stardust-text">{profile?.employment?.departmentName}</span>
                </div>
                <div className="flex justify-between border-b border-indigo-border/20 pb-1.5">
                  <span className="text-grey-text flex items-center gap-2"><Briefcase size={14} /> Designation</span>
                  <span className="font-semibold text-stardust-text">{profile?.employment?.designationName}</span>
                </div>
                <div className="flex justify-between border-b border-indigo-border/20 pb-1.5">
                  <span className="text-grey-text flex items-center gap-2"><Building size={14} /> Work Office</span>
                  <span className="font-semibold text-stardust-text">{profile?.employment?.locationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-grey-text flex items-center gap-2"><Calendar size={14} /> Joining Date</span>
                  <span className="font-semibold text-stardust-text">{formatDate(profile?.employment?.dateOfJoining)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
