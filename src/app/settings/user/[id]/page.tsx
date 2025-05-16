import BuggyButton from "@/app/components/BuggyButton";
import { getUserById, getUserInfo } from "@/app/lib/settings";
import { notFound } from "next/navigation";
import React from "react";

async function User({ params }: { params: { id: string } }) {
  const { name, id, username, website } = await getUserById(params.id);

  if (!name) {
    notFound();
  }
  return (
    <div>
      <h1 className="text-2xl font-bold">User ${params.id}</h1>

      <div
        className="
        border 
        border-dashed 
        border-red-500 
        p-4"
      >
        <p>Id: {id}</p>
        <p>Name: {name}</p>
        <p>Username: {username}</p>
        <p>Website: {website}</p>
      </div>
      <div className="mt-4">
        <BuggyButton />
      </div>
    </div>
  );
}

export default User;
