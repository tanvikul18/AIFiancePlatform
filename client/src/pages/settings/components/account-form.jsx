// AccountForm.js
import React, { useState } from "react";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../components/ui/button.jsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form.jsx";
import { Input } from "../../../components/ui/input.jsx";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar.jsx";
import { useAppDispatch } from "../../../app/hooks.js";
import { Loader } from "lucide-react";
import { useUpdateUserMutation } from "../../../features/user/userAPI.js";
import { updateCredentials } from "../../../features/auth/authSlice.js";
import { useSelector } from "react-redux";

const accountFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." })
    .optional(),
  profilePicture: z.string(),
});

export default function AccountForm() {
  const dispatch = useAppDispatch();
  const { user } = useSelector((state) => state.auth);

  const [file, setFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const[Imagetype,setImagetype]=useState(null);
  const [updateUserMutation, { isLoading }] = useUpdateUserMutation();

  const form = useForm({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: user?.name || "",
      profilePicture: user?.profilePicture || "",
    },
  });

  function onSubmit(values) {
    if (isLoading) return;

    const formData = new FormData();
    formData.append("name", values.name || "");
    if (file) formData.append("file", file);
   
    updateUserMutation(formData)
      .unwrap()
      .then((response) => {
        
        dispatch(
          updateCredentials({

            user: {
              profilePicture: response.data.profilePicture,
              name: response.data.name,
            },
          })
        );
       
        toast.success("Account updated successfully");
      })
      .catch((error) => {
      
        toast.error(error.data?.message || "Failed to update account");
      });
  }

  function handleAvatarChange(event) {
  
    const selected = event.target.files?.[0];
   
    if (!selected) {
      toast.error("Please select a file");
      return;
    }
    if (!selected.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setFile(selected);
    const reader = new FileReader();
    reader.onload = (e) => {
    
      const base64String = reader.result;
      setImagetype()
      setAvatarUrl(base64String)};
    reader.readAsDataURL(selected);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" enctype="multipart/form-data">
        <div className="flex flex-col items-start space-y-4">
          <FormLabel>Profile Picture</FormLabel>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={avatarUrl || user?.profilePicture || ""}
                className="!object-cover !object-center"
              />
              <AvatarFallback className="text-2xl">
                {form.watch("name")?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="max-w-[250px]"
              />
              <p className="text-xs text-muted-foreground">
                Recommended: Square JPG, PNG, at least 300x300px.
              </p>
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={isLoading} type="submit">
          {isLoading && <Loader className="h-4 w-4 animate-spin" />}
          Update account
        </Button>
      </form>
    </Form>
  );
}
