'use client';

import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import { FaChevronRight } from 'react-icons/fa6';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import dynamic from 'next/dynamic';
import { loadingIndicator } from '@/components/ui/LoadingIndicator';
import { useToast } from '@/components/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import CompanyDocumentUploadModal from '@/components/documents/company-document-upload-modal';

const RecentDocuments = dynamic(() => import('@/components/documents/RecentDocuments'), { ssr: false })

const CompanyDocuments = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [user, setUser] = useState<any>()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchDocuments = async () => {
    try {
      setMessage('fetching documents...')
      const res = await fetch(`/api/users`)
      const data = res.ok ? await res.json() : setMessage('Failed to fetch documents');
      setUser(data.user)
      console.log(data)
      setMessage('')
    } catch (error) {
      toast({
        description: 'Failed to fetch documents',
        variant: 'destructive'
      })
      console.log(error)
      setMessage('Failed to fetch documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, []);

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
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-md border border-gray-300"
          />
          <CompanyDocumentUploadModal setUser={setUser} />
        </div>
      </div>

      <div className="py-4">
        {loading ? (
          <p className="text-center">{loadingIndicator} {message}</p>
        ) : (
          user?.documents?.length > 0 ? <RecentDocuments docs={user.documents} /> : <p>No documents found</p>
        )}
      </div>
    </div>
  );
};

export default CompanyDocuments;

