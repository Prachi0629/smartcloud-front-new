import { useEffect, useState } from 'react';
import axios from 'axios';

function BucketDetails() {
  const [buckets, setBuckets] = useState([]);

  const loadBuckets = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await axios.get(
        'http://localhost:5000/api/buckets/all',
        {
          headers: { Authorization: token }
        }
      );

      setBuckets(Array.isArray(res.data) ? res.data : []);

    } catch (err) {
      console.log(err);
    }
  };

  const createBucket = async () => {
    const name = prompt('Enter Bucket Name');
    if (!name) return;

    try {
      const token = localStorage.getItem('token');

      await axios.post(
        'http://localhost:5000/api/buckets/create',
        { bucket_name: name },
        { headers: { Authorization: token } }
      );

      loadBuckets();

    } catch (err) {
      console.log(err);
    }
  };

  const deleteBucket = async (id) => {
    try {
      const token = localStorage.getItem('token');

      await axios.delete(
        `http://localhost:5000/api/buckets/delete/${id}`,
        { headers: { Authorization: token } }
      );

      loadBuckets();

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadBuckets();
  }, []);

  return (
    <div>
      <h1>My Buckets</h1>

      <button onClick={createBucket}>
        Create Bucket
      </button>

      {Array.isArray(buckets) && buckets.map((bucket) => (
        <div
          key={bucket.id}
          style={{
            border: '1px solid gray',
            margin: '20px',
            padding: '20px'
          }}
        >
          <h2>{bucket.bucket_name}</h2>

          <button onClick={() => deleteBucket(bucket.id)}>
            Delete Bucket
          </button>

          <h3>Files</h3>

          {(Array.isArray(bucket.files) ? bucket.files : []).map((file) => (
            <div key={file.id}>
              {file.file_name}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default BucketDetails;