import Header from '../components/Header';
import EditProfile from '../components/EditProfile';

function EditProfilePage() {
  return (
    <div>
      <Header />

      <main className="container">
        <EditProfile />
      </main>
    </div>
  );
}

export default EditProfilePage;