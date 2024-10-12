import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";


const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    const { mutateAsync: updateProfile, isPending: pendingUpdate, error } = useMutation({
		mutationFn: async (formData) => {
            const {user, ...rest} = formData
			try {
				const res = await fetch(`/api/users/updateProfile/${user?._id}`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify(rest)
				});
				const data = await res.json();

				if (!res.ok) throw new Error(data.error || data.message || "something went wrong")
				
				return data
			} catch (error) {
				console.log(error)
				throw new Error(error)
			}
		},
		onSuccess: () => {
			toast.success(`Profile successfully uploaded`)
			Promise.all([
				queryClient.invalidateQueries({queryKey: ["authUser"]}),
				queryClient.invalidateQueries({queryKey: ["userProfile"]}),
			])
		},
	})

    return { updateProfile, pendingUpdate };
}

export default useUpdateProfile