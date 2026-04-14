import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import './AddTrainingPoints.css';

function AddTrainingPoints() {
  const navigate = useNavigate();

  return (
    <main className="addTrainingPointsContent">
      <h1 className="addTrainingPointsHeading">Add Training Points</h1>

      <div className="addTrainingPointsCardsContainer">
        <Card 
          className="addTrainingPointsCard"
          onClick={() => navigate('/admin/add-training-points/single')}
        >
          <div className="addTrainingPointsCardContent">
            <h2>Add for a Single Student</h2>
            <p>Manually add training points to an individual student's profile.</p>
          </div>
        </Card>

        <Card 
          className="addTrainingPointsCard"
          onClick={() => navigate('/admin/add-training-points/csv')}
        >
          <div className="addTrainingPointsCardContent">
            <h2>Add From a CSV</h2>
            <p>Bulk upload training points for multiple students using a CSV file.</p>
          </div>
        </Card>
      </div>
    </main>
  );
}

export default AddTrainingPoints;
