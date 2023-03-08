import './Home.css';
import {useState, React} from 'react';
import {useQuery, QueryClientProvider, QueryClient} from 'react-query';

const twentyFourHoursInMs = 24 * 60 * 1000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnmount: false,
      refetchOnReconnect: false,
      retry: false,
      staleTime: twentyFourHoursInMs,
    },
  },
});

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
  const [shownCourseAssignments, setShownCourseAssignments] = useState([false]);

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
            <div key={gradeObject?.course_id} onClick={() => {
              // Right now this is re-rendering the entire page, and I don't really know why or how to make it better
              var shownAssignments = [...shownCourseAssignments];
              shownAssignments[index] = !shownAssignments[index];
              setShownCourseAssignments(shownAssignments);
            }}>
              <div className='Course Grade-Row'>
                <div className='Course-Name'> {gradeObject?.course_name} </div>
                <div className='Course-Grade'> {gradeObject?.grade_percentage}% ({gradeObject?.grade_letter})</div>
                <div className='Course-ID'> {gradeObject?.course_id} </div>
              </div>
            {shownCourseAssignments[index] ? gradeObject?.assignments.map((assignmentObject) => 
              <div  key={assignmentObject?.id} className={'Assignment Grade-Row'}>
                <div className='Assignment-Name'> {assignmentObject?.name} </div>
                <div className='Assignment-Name' dangerouslySetInnerHTML={{__html: assignmentObject?.description}}></div>
                <div className='Assignment-Grade'> {assignmentObject?.grade_percentage}% ({assignmentObject?.grade_letter})</div>
                <div className='Assignment-ID'> {assignmentObject?.id} </div>
              </div>
            ): ''}
            </div>
          )}
        </div>
      </div>
  );
}

export default Home;
