'use client';

import Link from 'next/link';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { FaChevronRight } from 'react-icons/fa6';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import dynamic from 'next/dynamic';
import { useToast } from '@/components/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import CompanyDocumentUploadModal from '@/components/documents/company-document-upload-modal';
import debounce from 'lodash/debounce';
import filter from 'lodash/filter';

const RecentDocuments = dynamic(() => import('@/components/documents/RecentDocuments'), { ssr: false })

interface Document {
  id: string;
  filename: string;
  url: string;
  uploadedDate: string;
  // Add other properties as needed
}

const CompanyDocuments = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [docs, setDocs] = useState<Document[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDocuments = async () => {
    try {
      setMessage('Fetching documents...');
      const res = await fetch(`/api/users`);
      if (!res.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await res.json();
      setDocs(data.user.documents);
      setMessage('');
    } catch (error) {
      toast({
        description: 'Failed to fetch documents',
        variant: 'destructive'
      });
      console.error(error);
      setMessage('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocs = useMemo(() => {
    return filter(docs, (doc) => 
      doc.filename?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [docs, searchTerm]);

  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-4 border-b-2 border-gray-300 pb-2">
        <h1 className="text-2xl font-semibold text-black flex items-center space-x-2">
          <Button variant="link" className="p-0 m-0">
            <Link href={`/user/documents`} className="text-2xl font-semibold hover:underline">
              Docs
            </Link>
          </Button>
          <FaChevronRight className="text-lg text-gray-500" />
          <span>Company Docs</span>
        </h1>
        <div className="flex items-center space-x-4">
          <Input
            type="text"
            placeholder="Search documents"
            onChange={handleSearch}
            className="px-4 py-2 rounded-md border border-gray-300"
            aria-label="Search documents"
          />
          <CompanyDocumentUploadModal setDocs={setDocs} />
        </div>
      </div>

      <div className="py-4">
        {loading ? (
          <p className="text-center flex items-center justify-center">
            <Loader2 className="text-bottomNavBarColor mr-2 animate-spin" />
            {message}
          </p>
        ) : filteredDocs.length > 0 ? (
          <RecentDocuments docs={filteredDocs} />
        ) : searchTerm ? (
          <p className="text-center">No documents found matching &quot;{searchTerm}&quot;</p>
        ) : (
          <p className="text-center">No documents found</p>
        )}
      </div>
    </div>
  );
};

export default CompanyDocuments;
