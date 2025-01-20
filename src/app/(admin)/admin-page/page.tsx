"use client"

import React, { useEffect, useState } from "react"
import { HomeIcon, UsersIcon, BuildingIcon as BuildingOfficeIcon, CogIcon, SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatNumber } from "@/utils/utilArray"

interface User {
  phone: string
  name: string
  role: { name: string }
  companyName: string
  address: string
  deviceType: string
  lastLogin: string
  createdAt : string
}

const AdminPage = () => {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("Dashboard")

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })
      if (res.status === 401) {
        localStorage.removeItem("adminToken")
        router.push("/user/profile/details")
      }
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      } else {
        throw new Error("Error fetching Users")
      }
    } catch (error) {
      console.error(error)
      alert("Failed to fetch users")
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter((user) =>
    Object.values(user).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const newUsers = users?.filter(user=>new Date(user.createdAt) === new Date(Date.now())).length


  const sidebarItems = [
    { icon: HomeIcon, label: "Dashboard" },
    { icon: CogIcon, label: "Settings" },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Image src="/awajahi logo.png" height={40} width={40} alt="Awajahi Logo" className="mr-3" />
              <h1 className="text-xl font-semibold text-gray-800">Awajahi</h1>
            </div>
            <Link href="/user/home">
              <Button variant="outline">Back to User Home</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-white shadow-md h-[calc(100vh-4rem)]">
          <ul className="py-4">
            {sidebarItems.map((item) => (
              <li
                key={item.label}
                className={`flex items-center px-6 py-3 cursor-pointer transition-colors duration-200 ${activeTab === item.label ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
                  }`}
                onClick={() => setActiveTab(item.label)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </aside>

        <main className="flex-1 p-8">
          <div className="grid grid-cols-4 gap-8 mb-4">
            <div className="p-4 text-black rounded-xl border bg-white text-left gap-4">
              <span className="text-sm">Total Users</span>
              <p className="mt-3 text-xl font-semibold">{formatNumber(users?.length)}</p>
            </div>
            <div className="p-4 text-black rounded-xl border bg-white text-left gap-4">
              <span className="text-sm">Total Users</span>
              <p className="mt-3 text-xl font-semibold">{formatNumber(users?.length)}</p>
            </div>
            <div className="p-4 text-black rounded-xl border bg-white text-left gap-4">
              <span className="text-sm">New Users</span>
              <p className="mt-3 text-xl font-semibold">{formatNumber(newUsers)}</p>
            </div>
            <div className="p-4 text-black rounded-xl border bg-white text-left gap-4">
              <span className="text-sm">Total Users</span>
              <p className="mt-3 text-xl font-semibold">{formatNumber(users?.length)}</p>
            </div>
          </div>
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">User Details</h1>
            <div className="relative">

              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Phone", "Name", "Role", "Company Name", "Address", "Device Type", "Last Login"].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.companyName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.deviceType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.lastLogin).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminPage

