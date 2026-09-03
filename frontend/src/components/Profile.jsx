function Profile({ profile, onEdit }) {
  return (
    <section className="card profile-card">

      <div className="profile-photo">
        {profile.name.charAt(0)}
      </div>

      <div className="profile-information">

        <h1>
          {profile.name}
          <span className="badge">
            First Class Scout
          </span>
        </h1>

        <p>
          @{profile.username}
        </p>

        <div className="profile-actions">

          <button
            className="btn btn-primary"
            onClick={onEdit}
          >
            Edit Profile
          </button>

          <button className="btn btn-outline">
            Friends ({profile.friends})
          </button>

        </div>

        <p>
          📍 {profile.location}
          &nbsp; 🏕️ {profile.troop}
        </p>

        <p>
          {profile.bio}
        </p>

        <p>
          <strong>Favourite Activity:</strong> Camping
        </p>

      </div>

    </section>
  );
}

export default Profile;