use anchor_lang::prelude::*;

#[error_code]
pub enum ClassError {
    #[msg("This student already exists")]
    StudentExists,
    #[msg("This student does not exist")]
    StudentDoesNotExist,
    #[msg("Grades already exist for this student")]
    GradesExist,
    #[msg("This number exceeds the maximum grade")]
    GradeTooHigh,
    #[msg("This number is below the minimum grade")]
    GradeTooLow,
    #[msg("This name is too long")]
    NameLengthExceeded
}