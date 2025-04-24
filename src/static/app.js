document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Add delete icon next to each participant
        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants">
            <h5>Participants:</h5>
            <ul style="list-style-type: none; padding: 0;">
              ${
                details.participants.length > 0
                  ? details.participants.map((participant) => `
                      <li style="display: flex; align-items: center;">
                        <span>${participant}</span>
                        <button class="delete-participant" data-activity="${name}" data-participant="${participant}" style="margin-left: 10px;">❌</button>
                      </li>
                    `).join("")
                  : "<li>No participants yet</li>"
              }
            </ul>
          </div>
        `;

        // Add event listener for delete buttons
        activityCard.querySelectorAll(".delete-participant").forEach((button) => {
          button.addEventListener("click", async (event) => {
            const activityName = button.getAttribute("data-activity");
            const participantEmail = button.getAttribute("data-participant");

            try {
              const response = await fetch(
                `/activities/${encodeURIComponent(activityName)}/unregister?email=${encodeURIComponent(participantEmail)}`,
                {
                  method: "POST",
                }
              );

              if (response.ok) {
                alert(`${participantEmail} has been unregistered from ${activityName}`);
                fetchActivities(); // Refresh the activities list
              } else {
                const result = await response.json();
                alert(result.detail || "Failed to unregister participant.");
              }
            } catch (error) {
              console.error("Error unregistering participant:", error);
              alert("An error occurred. Please try again.");
            }
          });
        });

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Refresh the activities list after successful signup
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
