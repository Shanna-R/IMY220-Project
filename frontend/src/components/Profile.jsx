function Profile({ onEdit }) {
  return (
    <section className="card profile-card">

      <div className="profile-photo">
        👤
      </div>

      <div className="profile-information">

        <h1>
          Shanna Reinecke
          <span className="badge">
            First Class Scout
          </span>
        </h1>

        <div className="profile-actions">
          <button
            className="btn btn-primary"
            onClick={onEdit}
          >
            Edit Profile
          </button>

          <button className="btn btn-outline">
            Friends (127)
          </button>
        </div>

        <p>
          📍 South Africa
          &nbsp; 🏕️ 8th Pretoria St Albans
          &nbsp; 📅 Member since March 2016
        </p>

        <p>
          Hiking enthusiast, knot tying expert,
          and Patrol Leader at St Albans.
          Constantly exploring the trails of the
          Drakensberg. Always prepared!
        </p>

        <p>
          <strong>Favourite Activity:</strong> Camping
        </p>

      </div>

    </section>
  );
}

export default Profile;