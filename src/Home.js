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
        <table className='Grade-Table'>
          <tbody>
            <tr className='Grade-Column-Headers'>
              <th className='Header Name'>Name</th>
              <th className='Header Grade'>Grade</th>
              <th className='Header ID'>ID</th>
            </tr>
            {grades.map((gradeObject, i) => 
              <>
                <tr className='Course Grade-Row' onClick={() => {
                var shownAssignments = [...shownCourseAssignments];
                shownAssignments[i] = !shownAssignments[i];
                setShownCourseAssignments(shownAssignments);
              }}>
                  <td className='Course Name'> {gradeObject?.course_name} </td>
                  <td className='Course Grade'> {gradeObject?.grade_percentage}% ({gradeObject?.grade_letter})</td>
                  <td className='Course ID'> {gradeObject?.course_id} </td>
                </tr>
              {shownCourseAssignments[i] ? gradeObject?.assignments.map((assignmentObject, j) => 
                <>
                  <tr  key={assignmentObject?.id} className={'Assignment Grade-Row'} onClick={() => {
                var shownDescriptions = [...shownAssignmentDescriptions];
                if (!shownDescriptions[i]) {
                  shownDescriptions[i] = [];
                  shownDescriptions[i][j] = true;
                }
                else shownDescriptions[i][j] = !shownDescriptions[i][j];
                setShownAssignmentDescriptions(shownDescriptions);
              }}>
                    <td className='Assignment Name'> {assignmentObject?.name} </td>
                    <td className='Assignment Grade'> {
                      assignmentObject?.workflow_state === 'submitted' ? 
                      'Not Yet Graded':
                      assignmentObject?.grade_percentage === null ?
                      'Doesn\'t count towards final grade':
                      assignmentObject?.workflow_state === 'graded' ?
                      assignmentObject?.grade_percentage + '% (' + assignmentObject?.grade_letter + ')'
                      : 
                      'Not Turned In'
                    }</td>
                    <td className='Assignment ID'> {assignmentObject?.id} </td>
                  </tr>
                  {shownAssignmentDescriptions[i] ? shownAssignmentDescriptions[i][j] ? 
                  <tr className='Assignment Description'>
                    <td colSpan='3'>
                      <div dangerouslySetInnerHTML={{__html: assignmentObject?.description}}></div>
                    </td>
                  </tr>: '': ''}
                </>
              ): ''}
              </>
            )}
          </tbody>
        </table>
      </div>
  );
}

export default Home;
