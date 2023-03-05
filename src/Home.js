import './Home.css';
import {useQuery, QueryClientProvider, QueryClient} from 'react-query';

const queryClient = new QueryClient();

const fetchData = () => {
  return fetch('http://localhost:8092')
  .then((response) => response.json());
}

function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <Grades />
    </QueryClientProvider>
  )
}

function Grades() {
  const {isLoading, error, data} = useQuery('Grades', fetchData);
  const grades = data ?? []

  if(isLoading){
    return <div className='Loading'>Loading...</div>;
  }

  if(error){
    return <div className='Error'>Error! {error.message}</div>;
  }

  return (
      <div className='Home'>
        <div className='Grade-Grid'>
          <div className='Grade-Column-Headers'>
            <div className='Course-Name'>Course Name</div>
            <div className='Grade'>Grade</div>
            <div className='Course-ID'>Course ID</div>
          </div>
          {grades.map((gradeObject, index) => 
            <div key={'Grade' + index} className='Grade-Row'>
              <div className='Course-Name'> {gradeObject?.course_name} </div>
              <div className='Grade'> {gradeObject?.grade_percentage}% ({gradeObject?.grade_letter})</div>
              <div className='Course-ID'> {gradeObject?.course_id} </div>
            </div>
          )}
        </div>
      </div>
  );
}

export default Home;
