import { useEffect, useState } from "react";
import useUpdateProfile from "../../hooks/useUpdateProfile";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const EditProfileModal = ({authUser}) => {
	const [formData, setFormData] = useState({
		bio: "",
		link: "",
		newPassword: "",
		currentPassword: "",
	});

	const {updateProfile, pendingUpdate, error} = useUpdateProfile()

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	useEffect(() => {
		if (authUser) {
			setFormData({
				fullName: authUser.fullName,
				username: authUser.username,
				email: authUser.email,
				bio: authUser.bio,
				link: authUser.link,
				newPassword: "",
				currentPassword: "",
			});
		}
	}, [authUser]);

	return (
		<>
			<button
				className='btn btn-outline rounded-full btn-sm'
				onClick={() => document.getElementById("edit_profile_modal").showModal()}
			>
				Edit profile
			</button>
			<dialog id='edit_profile_modal' className='modal'>
				<div className='modal-box border rounded-md border-gray-700 shadow-md'>
					<h3 className='font-bold text-lg my-3'>Update Profile</h3>
					<form
						className='flex flex-col gap-4'
						onSubmit={async (e) => {
							e.preventDefault();
							const {user} = authUser;
							await updateProfile({...formData, user});
							setFormData({
								bio: "",
								link: "",
								newPassword: "",
								currentPassword: "",
							})
							if (!error) {
								const dialog = document.getElementById('edit_profile_modal');
								dialog.close();
							}
						}}
					>
						<div className='flex flex-wrap gap-2'>
							<input
								type="url"
								placeholder="https://example.com"
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.link}
								name='link'
								onChange={handleInputChange}
							/>
							<textarea
								placeholder='Bio'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.bio}
								name='bio'
								onChange={handleInputChange}
							/>
						</div>
						<div className='flex flex-wrap gap-2'>
							<input
								type='password'
								placeholder='Current Password'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.currentPassword}
								name='currentPassword'
								onChange={handleInputChange}
							/>
							<input
								type='password'
								placeholder='New Password'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.newPassword}
								name='newPassword'
								onChange={handleInputChange}
							/>
						</div>
						
						<button className='btn btn-primary rounded-full btn-sm text-white'>
							{pendingUpdate && <LoadingSpinner size="sm" />}
							{!pendingUpdate && "Update"}
						</button>
					</form>
				</div>
				<form method='dialog' className='modal-backdrop'>
					<button className='outline-none'>close</button>
				</form>
			</dialog>
		</>
	);
};
export default EditProfileModal;