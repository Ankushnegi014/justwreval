"use client"
import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import withAuth from "../components/withAuth";

type Trip = {
  _id: string;
  title: string;
  destination: string;
  days: number;
  budget: number;
  createdAt: string;
};

const defaultTrip = {
  title: "",
  destination: "",
  days: 1,
  budget: 0
};

const GetTrips = "http://localhost:4000/api/get-trips";
const CreateTrip = "http://localhost:4000/api/add-trips";
const UpdateTrip = "http://localhost:4000/api/update-trips";

function Trips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditId, setModalEditId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultTrip);
  const [loading, setLoading] = useState(true);

  // Fetch trips
  const fetchTrips = async () => {
    setLoading(true);
    const res = await axios.get(GetTrips);
    setTrips(res.data);
    setLoading(false);
  };
  useEffect(() => { fetchTrips(); }, []);

  // Open/Close Modal
  const openModal = (trip?: Trip) => {
    if (trip) {
      setForm({
        title: trip.title,
        destination: trip.destination,
        days: trip.days,
        budget: trip.budget
      });
      setModalEditId(trip._id);
    } else {
      setForm(defaultTrip);
      setModalEditId(null);
    }
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  // Submit Create/Edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalEditId) {
        // Update
        await axios.put(`${UpdateTrip}/${modalEditId}`, form);
      } else {
        // Create
        await axios.post(CreateTrip, form);
      }
      closeModal();
      fetchTrips();
    } catch (err: any) {
      alert("Error: " + err.response?.data?.message || "Unknown error");
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "2rem auto" }}>
      <h2>Trips</h2>
      <button onClick={() => openModal()} style={{ marginBottom: 24 }}>Create Trip</button>
      {loading ? <p>Loading...</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th className="text-center">Title</th>
              <th className="text-center">Destination</th>
              <th className="text-center">Days</th>
              <th className="text-center">Budget</th>
              <th className="text-center">Created At</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip) => (
              <tr key={trip._id}>
                <td className="text-center">{trip.title}</td>
                <td className="text-center">{trip.destination}</td>
                <td className="text-center">{trip.days}</td>
                <td className="text-center">{trip.budget}</td>
                <td className="text-center">{new Date(trip.createdAt).toLocaleDateString()}</td>
                <td className="text-center">
                  <button className="cursor-pointer" onClick={() => openModal(trip)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal for create/edit */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        contentLabel={modalEditId ? "Edit Trip" : "Create Trip"}
        ariaHideApp={false}
      >
        <h2>{modalEditId ? "Edit Trip" : "Create Trip"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-row items-center gap-2">
            <label className="">Title</label>
            <input className="border rounded"
              placeholder="Title"
              value={form.title}
              required
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              style={{ width: "100%", margin: "8px 0", padding: 8 }}
            />
          </div>
          <div className="flex flex-row items-center gap-2">
            <label className="">Destination</label>
            <input className="border rounded"
              placeholder="Destination"
              value={form.destination}
              required
              onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
              style={{ width: "100%", margin: "8px 0", padding: 8 }}
            />
          </div>
          <div className="flex flex-row items-center gap-2">
            <label className="">Days</label>
            <input className="border rounded"
              type="number"
              placeholder="Days"
              value={form.days}
              min={1}
              required
              onChange={e => setForm(f => ({ ...f, days: Number(e.target.value) }))}
              style={{ width: "100%", margin: "8px 0", padding: 8 }}
            />
          </div>
          <div className="flex flex-row items-center gap-2">
            <label className="">Budget</label>
            <input className="border rounded"
              type="number"
              placeholder="Budget"
              value={form.budget}
              min={0}
              required
              onChange={e => setForm(f => ({ ...f, budget: Number(e.target.value) }))}
              style={{ width: "100%", margin: "8px 0", padding: 8 }}
            />
          </div>
          <div className="flex flex-row items-center justify-end gap-4 mt-4">
            <button className="border rounded px-4 py-1 cursor-pointer" type="submit" style={{ marginRight: 8 }}>{modalEditId ? "Update" : "Create"}</button>
            <button className="border rounded px-4 py-1 cursor-pointer" type="button" onClick={closeModal}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default withAuth(Trips);
