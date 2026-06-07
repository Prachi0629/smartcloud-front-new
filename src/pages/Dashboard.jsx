import { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/dashboard.css';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

import {
  FaFolder,
  FaTrash,
  FaCloudUploadAlt,
  FaFileAlt,
  FaDatabase,
  FaMoneyBillWave,
  FaBars,
  FaCloud,
  FaPlus,
  FaReceipt
} from 'react-icons/fa';

const BASE_URL = 'http://localhost:5000';

const COLORS = ['#2563eb', '#22c55e', '#f97316', '#ef4444'];

/* ✅ AUTH HEADER FIX (IMPORTANT) */
const getAuthHeader = () => {
  const token = localStorage.getItem('token');

  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

function Dashboard() {
  const [buckets, setBuckets] = useState([]);
  const [trashFiles, setTrashFiles] = useState([]);
  const [trashBuckets, setTrashBuckets] = useState([]);
  const [mobileMenu, setMobileMenu] = useState(false);
const [showInvoice, setShowInvoice] =
  useState(false);

  const [stats, setStats] = useState({
    totalBuckets: 0,
    totalFiles: 0,
    totalStorage: 0,
  monthlyBill: 0,
gst: 0,
finalAmount: 0
  });

  const graphData = [
    { name: 'Files', value: stats.totalFiles },
    { name: 'Storage', value: Number(stats.totalStorage) },
    {
      name: 'Trash',
      value: trashFiles.length + trashBuckets.length
    }
  ];

  const activityData = [
    { name: 'Buckets', value: stats.totalBuckets },
    { name: 'Files', value: stats.totalFiles },
    {
      name: 'Trash',
      value: trashFiles.length + trashBuckets.length
    }
  ];

const userName =
  localStorage.getItem('name') ||
  'User';

const userEmail =
  localStorage.getItem('email') ||
  'user@gmail.com';

  /* ================= LOAD DASHBOARD ================= */

  const loadDashboard = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/buckets/all`,
        getAuthHeader()
      );

      const bucketData = Array.isArray(res.data) ? res.data : [];

      const cleanedBuckets = bucketData.map((bucket) => ({
        ...bucket,
        files: (bucket.files || []).filter((f) => !f.is_deleted)
      }));

      setBuckets(cleanedBuckets);

      const trashRes = await axios.get(
        `${BASE_URL}/api/files/trash/all`,
        getAuthHeader()
      );

      setTrashFiles(Array.isArray(trashRes.data) ? trashRes.data : []);

      const trashBucketRes = await axios.get(
        `${BASE_URL}/api/buckets/trash/all`,
        getAuthHeader()
      );

      setTrashBuckets(
        Array.isArray(trashBucketRes.data) ? trashBucketRes.data : []
      );

      /* STATS */
      let totalFiles = 0;
let totalStorageBytes = 0;

cleanedBuckets.forEach((bucket) => {
  const files = Array.isArray(bucket.files)
    ? bucket.files
    : [];

  totalFiles += files.length;

  files.forEach((file) => {
    totalStorageBytes +=
      Number(file.file_size || 0);
  });
});

const totalStorageGB =
  totalStorageBytes / (1024 * 1024 * 1024);


const monthlyBill =
  totalStorageGB * 5;

const gst =
  monthlyBill * 0.18;

const finalAmount =
  monthlyBill + gst;


setStats({
  totalBuckets: cleanedBuckets.length,
  totalFiles,
  totalStorage: Number(
    totalStorageGB.toFixed(2)
  ),
  monthlyBill:
    monthlyBill.toFixed(2),
  gst: gst.toFixed(2),
  finalAmount:
    finalAmount.toFixed(2)
});
} catch (err) {

  console.log(err);

}
};

  /* ================= FILE OPEN ================= */

  const openFile = (path) => {
    window.open(`${BASE_URL}/${path}`, '_blank');
  };

  /* ================= BUCKET ================= */

  const createBucket = async () => {

  const bucketName = prompt(
    'Enter Bucket Name'
  );

  if (!bucketName) return;

  /* CHECK DUPLICATE */

  const alreadyExists =
    buckets.some(
      (bucket) =>
        bucket.bucket_name
          .toLowerCase()
          .trim() ===
        bucketName
          .toLowerCase()
          .trim()
    );

  if (alreadyExists) {

    alert(
      'Bucket already exists'
    );

    return;

  }

  try {

    await axios.post(
      `${BASE_URL}/api/buckets/create`,
      {
        bucket_name: bucketName
      },
      getAuthHeader()
    );

    await loadDashboard();

  } catch (err) {

    console.log(err);

    alert(
      'Bucket creation failed'
    );

  }

};



/* ================= DELETE BUCKET ================= */

const deleteBucket = async (id) => {

  try {

    await axios.delete(
      `${BASE_URL}/api/buckets/delete/${id}`,
      getAuthHeader()
    );

    await loadDashboard();

  } catch (err) {

    console.log(err);

  }

};

/* ================= RESTORE BUCKET ================= */

const restoreBucket = async (id) => {

  try {

    await axios.put(
      `${BASE_URL}/api/buckets/restore/${id}`,
      {},
      getAuthHeader()
    );

    await loadDashboard();

  } catch (err) {

    console.log(err);

  }

};

/* ================= DELETE PERMANENT ================= */

const deleteBucketPermanent = async (id) => {

  try {

    await axios.delete(
      `${BASE_URL}/api/buckets/permanent/${id}`,
      getAuthHeader()
    );

    await loadDashboard();

  } catch (err) {

    console.log(err);

  }

};




  /* ================= FILE ================= */

  const uploadFile = async (bucketId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(
        `${BASE_URL}/api/files/upload/${bucketId}`,
        formData,
        {
          ...getAuthHeader(),
          headers: {
            ...getAuthHeader().headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      await loadDashboard();
    } catch (err) {
      console.log(err);
      alert('Upload failed');
    }
  };

  const moveToTrash = async (fileId) => {
    try {
      await axios.put(
        `${BASE_URL}/api/files/trash/${fileId}`,
        {},
        getAuthHeader()
      );

      await loadDashboard();
    } catch (err) {
      console.log(err);
    }
  };

  const restoreFile = async (fileId) => {
    try {
      await axios.put(
        `${BASE_URL}/api/files/restore/${fileId}`,
        {},
        getAuthHeader()
      );

      await loadDashboard();
    } catch (err) {
      console.log(err);
    }
  };

  const deleteFilePermanent = async (fileId) => {
    try {
      await axios.delete(
        `${BASE_URL}/api/files/permanent/${fileId}`,
        getAuthHeader()
      );

      await loadDashboard();
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= LOGOUT ================= */

  /* ================= LOGOUT ================= */

const logout = () => {

  localStorage.removeItem('token');

  localStorage.removeItem('name');

  localStorage.removeItem('email');

  window.location.href = '/login';

};

  useEffect(() => {
    loadDashboard();
  }, []);

  /* ================= UI ================= */

  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}
      <div className={`sidebar ${mobileMenu ? 'show-sidebar' : ''}`}>
        <div className="sidebar-top">
          <h2 className="logo">
            <FaCloud /> SmartCloud
          </h2>
        </div>

        <ul className="sidebar-links">
          <li><a href="#dashboard">Dashboard</a></li>
          <li><a href="#buckets">Buckets</a></li>
          <li><a href="#analytics">Analytics</a></li>
          <li><a href="#trash">Trash Bin</a></li>
        </ul>
      </div>

      {/* MAIN */}
      <div className="dashboard-container">

        {/* NAVBAR */}
        <div className="dashboard-navbar">

  <div className="nav-left">

    <button
      className="menu-btn"
      onClick={() =>
        setMobileMenu(!mobileMenu)
      }
    >
      <FaBars />
    </button>

    <h1>
      Cloud Storage Dashboard
    </h1>

  </div>

  <div className="nav-actions">

    <button
      className="invoice-btn"
      onClick={() =>
        setShowInvoice(true)
      }
    >
      <FaReceipt />
      Invoice
    </button>

    <button
      className="logout-btn"
      onClick={logout}
    >
      Logout
    </button>

  </div>

</div>

        {/* HERO */}
        <div className="hero-card" id="dashboard">
          <h1>Welcome Back 👋</h1>
          <p>Manage your cloud storage efficiently</p>
        </div>

        {/* STATS */}
        <div className="stats-grid">
          <div className="stat-card"><FaFolder /><h3>Total Buckets</h3><h2>{stats.totalBuckets}</h2></div>
          <div className="stat-card"><FaFileAlt /><h3>Total Files</h3><h2>{stats.totalFiles}</h2></div>
          <div className="stat-card"><FaDatabase /><h3>Storage Used</h3><h2>{stats.totalStorage} GB</h2></div>
          <div className="stat-card"><FaMoneyBillWave /><h3>Bill</h3><h2>₹{stats.monthlyBill}</h2></div>
        </div>

        {/* CHARTS */}
        <div className="charts-grid" id="analytics">

          <div className="graph-card">
            <h2>Storage Analytics</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={graphData} dataKey="value" outerRadius={100} label>
                  {graphData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="graph-card">
            <h2>Activity Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* CREATE */}
        <div className="top-actions">
          <button className="create-btn" onClick={createBucket}>
            <FaPlus /> Create Bucket
          </button>
        </div>

        {/* BUCKETS */}
       

<div className="bucket-grid" id="buckets">

  {buckets.length > 0 ? (

    buckets.map((bucket) => (

      <div
        className="bucket-card"
        key={bucket.id}
      >

        {/* HEADER */}

        <div className="bucket-header">

          <h2>
            <FaFolder />
            {bucket.bucket_name}
          </h2>

          <button
            className="delete-btn"
            onClick={() =>
              deleteBucket(bucket.id)
            }
          >
            Delete
          </button>

        </div>

        {/* FILE LIST */}

        {/* FILE LIST */}

<div className="file-list">

  {bucket.files &&
  bucket.files.length > 0 ? (

    bucket.files.map((file) => (

      <div
        className="file-item"
        key={file.id}
      >

        {/* FILE DETAILS */}

        <div className="file-info">

          <h3 className="file-name">
  {file.file_name || 'Unnamed File'}
</h3>

<p className="file-type">
  {file.file_type || 'Unknown Type'}
</p>

<p className="file-size">
  {file.file_size
    ? (file.file_size / 1024).toFixed(2)
    : 0}
  KB
</p>

        </div>

        {/* ACTION BUTTONS */}

        <div className="file-actions">

          <a
            href={`${BASE_URL}/${file.file_path}`}
            target="_blank"
            rel="noreferrer"
            className="view-btn"
          >
            View
          </a>

          <button
            className="trash-btn"
            onClick={() =>
              moveToTrash(file.id)
            }
          >
            Trash
          </button>

        </div>

      </div>

    ))

  ) : (

    <p className="empty-text">
      No files uploaded
    </p>

  )}

</div>

        {/* UPLOAD BUTTON */}

        <label className="upload-btn">

          <FaCloudUploadAlt />

          Upload File

          <input
            type="file"
            hidden
            onChange={(e) =>
              uploadFile(bucket.id, e)
            }
          />

        </label>

      </div>

    ))

  ) : (

    <div className="empty-dashboard">

      <h2>
        No Buckets Created
      </h2>

      <p>
        Create your first bucket
      </p>

    </div>

  )}

</div>

        {/* TRASH */}
        {/* TRASH BIN */}

<div
  className="trash-section"
  id="trash"
>

  <h2>
    Trash Bin
  </h2>

  <div className="trash-grid">

    {/* TRASH BUCKETS */}

    {trashBuckets.map((bucket) => (

      <div
        className="trash-card"
        key={bucket.id}
      >

        <div>

          <h4>
            {bucket.bucket_name}
          </h4>

          <small>
            Deleted Bucket
          </small>

        </div>

        <div className="trash-actions">

          <button
            className="restore-btn"
            onClick={() =>
              restoreBucket(bucket.id)
            }
          >
            Restore
          </button>

          <button
            className="delete-permanent-btn"
            onClick={() =>
              deleteBucketPermanent(
                bucket.id
              )
            }
          >
            Delete
          </button>

        </div>

      </div>

    ))}

    {/* TRASH FILES */}

    {trashFiles.map((file) => (

      <div
        className="trash-card"
        key={file.id}
      >

        <div>

          <h4>
            {file.file_name}
          </h4>

          <small>
            {file.file_type}
          </small>

        </div>

        <div className="trash-actions">

          <button
            className="restore-btn"
            onClick={() =>
              restoreFile(file.id)
            }
          >
            Restore
          </button>

          <button
            className="delete-permanent-btn"
            onClick={() =>
              deleteFilePermanent(
                file.id
              )
            }
          >
            Delete
          </button>

        </div>

      </div>

    ))}

  </div>

  {trashBuckets.length === 0 &&
   trashFiles.length === 0 && (

    <p className="empty-text">
      Trash Empty
    </p>

  )}

</div>





</div>



{showInvoice && (

  <div className="invoice-modal">

    <div className="invoice-card">

      <h2>
        Storage Invoice
      </h2>

      <div className="invoice-details">

        <p>
          <strong>Name:</strong> {userName}
        </p>

        <p>
          <strong>Email:</strong>
          {userEmail}
        </p>

        <p>
          <strong>Total Storage Used:</strong>
          {stats.totalStorage} GB
        </p>

        <p>
          <strong>Total Files:</strong>
          {stats.totalFiles}
        </p>

        <p>
          <strong>Monthly Bill:</strong>
          ₹{stats.monthlyBill}
        </p>

        <p>
          <strong>GST (18%):</strong>
          ₹{stats.gst}
        </p>

        <h3>
          Final Amount:
          ₹{stats.finalAmount}
        </h3>

      </div>

      <button
        className="close-btn"
        onClick={() =>
          setShowInvoice(false)
        }
      >
        Close
      </button>

    </div>

  </div>

)}




</div>
  );

}
export default Dashboard;