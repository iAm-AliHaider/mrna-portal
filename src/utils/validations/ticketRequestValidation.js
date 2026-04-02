import * as Yup from 'yup';

const ticketRequestValidationSchema = Yup.object({
  departure_date: Yup.date().required('Departure date is required'),
  return_date: Yup.date().required('Return date is required'),
  country: Yup.string().required('Country is required'),
  city: Yup.string().required('City is required'),
  preferred_departure_time: Yup.string().required('Preferred departure time is required'),
  preferred_return_time: Yup.string().required('Preferred return time is required'),
  ref_number: Yup.string().notRequired(),
  notes: Yup.string().max(1000, 'Notes is too long').test('no-spaces', 'Spaces are not allowed', value => {
    return !value || value.trim().length > 0;
  }),
  adult_number_of_tickets: Yup.number().integer('Must be an integer').min(0, 'Cannot be negative').required('Required'),
  child_number_of_tickets: Yup.number().integer('Must be an integer').min(0, 'Cannot be negative').required('Required'),
  ticket_class: Yup.string().required('Ticket class is required'),
  adult_ticket_cost: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  child_ticket_cost: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Required'),
  total_cost: Yup.number().typeError('Must be a number'),
  vacation_attachment: Yup.string().nullable(),
});

export default ticketRequestValidationSchema; 