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
  const [shownCourseAssignments, setShownCourseAssignments] = useState([]);
  const [shownAssignmentDescriptions, setShownAssignmentDescriptions] = useState([]);

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
            <div className='Header Name'>Name</div>
            <div className='Header Grade'>Grade</div>
            <div className='Header ID'>ID</div>
          </div>
          {grades.map((gradeObject, i) => 
            <div key={gradeObject?.course_id}>
              <div className='Course Grade-Row' onClick={() => {
              var shownAssignments = [...shownCourseAssignments];
              shownAssignments[i] = !shownAssignments[i];
              setShownCourseAssignments(shownAssignments);
            }}>
                <div className='Course Name'> {gradeObject?.course_name} </div>
                <div className='Course Grade'> {gradeObject?.grade_percentage}% ({gradeObject?.grade_letter})</div>
                <div className='Course ID'> {gradeObject?.course_id} </div>
              </div>
            {shownCourseAssignments[i] ? gradeObject?.assignments.map((assignmentObject, j) => 
              <>
                <div  key={assignmentObject?.id} className={'Assignment Grade-Row'} onClick={() => {
              var shownDescriptions = [...shownAssignmentDescriptions];
              if (!shownDescriptions[i]) {
                shownDescriptions[i] = [];
                shownDescriptions[i][j] = true;
              }
              else shownDescriptions[i][j] = !shownDescriptions[i][j];
              setShownAssignmentDescriptions(shownDescriptions);
            }}>
                  <div className='Assignment Name'> -- {assignmentObject?.name} </div>
                  <div className='Assignment Grade'> -- {
                    assignmentObject?.workflow_state === 'submitted' ? 
                    'Not Yet Graded':
                    assignmentObject?.grade_percentage === null ?
                    'Doesn\'t count towards final grade':
                    assignmentObject?.workflow_state === 'graded' ?
                    assignmentObject?.grade_percentage + '% (' + assignmentObject?.grade_letter + ')'
                    : 
                    'Not Turned In'
                  }</div>
                  <div className='Assignment ID'> -- {assignmentObject?.id} </div>
                </div>
                {shownAssignmentDescriptions[i] ? shownAssignmentDescriptions[i][j] ? <div className='Assignment Description' dangerouslySetInnerHTML={{__html: assignmentObject?.description}}></div>: '': ''}
              </>
            ): ''}
            </div>
          )}
        </div>
      </div>
  );
}

export default Home;
