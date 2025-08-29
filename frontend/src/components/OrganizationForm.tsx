import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { CREATE_ORGANIZATION, UPDATE_ORGANIZATION } from '../graphql/mutations';
import { GET_ORGANIZATIONS } from '../graphql/queries';
import type { Organization, OrganizationFormData } from '../types';

interface Props {
  organization?: Organization;
  onClose: () => void;
  onSuccess?: () => void;
}

export const OrganizationForm: React.FC<Props> = ({ organization, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: organization?.name || '',
    slug: organization?.slug || '',
    contactEmail: organization?.contactEmail || ''
  });

  const [errors, setErrors] = useState<string[]>([]);

  const [createOrganization, { loading: creating }] = useMutation(CREATE_ORGANIZATION, {
    refetchQueries: [{ query: GET_ORGANIZATIONS }]
  });

  const [updateOrganization, { loading: updating }] = useMutation(UPDATE_ORGANIZATION, {
    refetchQueries: [{ query: GET_ORGANIZATIONS }]
  });

  const loading = creating || updating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    try {
      if (organization) {
        await updateOrganization({
          variables: {
            id: organization.id,
            ...formData
          }
        });
      } else {
        await createOrganization({
          variables: formData
        });
      }
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Organization operation failed:', error);
      if (error.graphQLErrors) {
        setErrors(error.graphQLErrors.map((err: any) => err.message));
      } else {
        setErrors(['An unexpected error occurred']);
      }
    }
  };

  const handleInputChange = (field: keyof OrganizationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from name if it's a new organization
    if (field === 'name' && !organization) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {organization ? 'Edit Organization' : 'Create Organization'}
        </h2>

        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleInputChange('slug', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              pattern="[a-z0-9-]+"
              title="Only lowercase letters, numbers, and hyphens allowed"
              required
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Used in URLs. Only lowercase letters, numbers, and hyphens.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Email *
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading || !formData.name.trim() || !formData.slug.trim() || !formData.contactEmail.trim()}
            >
              {loading ? 'Saving...' : (organization ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};