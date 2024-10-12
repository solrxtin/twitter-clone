import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useFollow = () => {
	const queryClient = useQueryClient();
	const { mutate: follow, isPending } = useMutation({
		mutationFn: async (user) => {
			try {
				const res = await fetch(`/api/users/follow/${user._id}`, {
					method: "POST",
				});

				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong!");
				}
				return { user };
			} catch (error) {
				throw new Error(error.message);
			}
		},
		onSuccess: (data) => {
			Promise.all([
				queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
				queryClient.invalidateQueries({ queryKey: ["authUser"] }),
			]);
            toast.success(`Successfully followed ${data.user.username}`)
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return { follow, isPending };
};

export default useFollow;