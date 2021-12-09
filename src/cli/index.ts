// @ts-nocheck

const find = {
  async Patient() {},
};

function where() {}

function join() {}

function limit() {}

function skip() {}

function select() {}

class Column {
  is() {}
}

class Patient {
  static doctor = new Column();
  static firstName = new Column();
}

class Attachment {}

class Clinic {}

class Doctor {}

class SharedUser {
  static id = new Column()
}

class Treatment {}



find.Patient(
  where(Patient.doctor.is(doctorId)),
  join(
    [Attachment, as('Identification')],
    Clinic,
    Doctor,
    [SharedUser, where(SharedUser.id.is(sharedUser))],
    {Treatment, join(Clinic)},
    User.view()
  ),
  limit(100),
  skip(20),
  select(Patient.firstName)
);
