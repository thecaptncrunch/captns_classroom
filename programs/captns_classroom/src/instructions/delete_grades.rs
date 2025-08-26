use anchor_lang::{prelude::*};

use crate::states::*;

pub fn delete_grades(ctx: Context<DeleteGrades>) -> Result<()> {
    
    // only the student can remove their grades
    assert_eq!(ctx.accounts.student.student_id.key(), ctx.accounts.submitter.key());

    // reset final grade
    ctx.accounts.student.final_grade = 0.0;

    Ok(())
}

#[derive(Accounts)]
pub struct DeleteGrades<'info> {
    #[account(mut)]
    submitter: Signer<'info>,

    #[account(
        mut,
        close = submitter,
        seeds = [GRADE_SEED.as_bytes(), grades.grader.key().as_ref()],
        bump
    )]
    pub grades: Account<'info, Grades>,

    #[account(
        mut,
        seeds = [student.first_name.as_bytes(), STUDENT_SEED.as_bytes(), student.student_id.key().as_ref()],
        bump
    )]
    pub student: Account<'info, Student>,
}