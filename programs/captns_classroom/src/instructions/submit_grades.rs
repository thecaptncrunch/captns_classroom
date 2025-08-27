use anchor_lang::{prelude::*};

use crate::{instruction};
use crate::states::{self, *};
use crate::errors::ClassError;

pub fn submit_grades(ctx: Context<SubmitGrades>, midterm: f32, _final: f32, homework_a: f32, homework_b: f32) 
-> Result<()> {

    // only the student can submit their grades
    assert_eq!(ctx.accounts.student.student_id.key(), ctx.accounts.submitter.key());

    // ensure grades are not too low 
    if midterm < 5.0 {
        return Err(ClassError::GradeTooLow.into());
    } else if _final < 5.0 {
        return Err(ClassError::GradeTooLow.into());
    } else if homework_a < 5.0 {
        return Err(ClassError::GradeTooLow.into());
    } else if homework_b < 5.0 {
        return Err(ClassError::GradeTooLow.into());
    }

    // ensure grades are not too high
    if midterm > 100.0 {
        return Err(ClassError::GradeTooHigh.into());
    } else if _final > 100.0 {
        return Err(ClassError::GradeTooHigh.into());
    } else if homework_a > 100.0 {
        return Err(ClassError::GradeTooHigh.into());
    } else if homework_b > 100.0 {
        return Err(ClassError::GradeTooHigh.into());
    }

    // set the grades in the account
    let grades = &mut ctx.accounts.grades;
    let student = &mut ctx.accounts.student;

    grades.grader = ctx.accounts.submitter.key();
    grades.student = student.first_name.clone();
    grades.set_midterm = midterm;
    grades.set_final = _final;
    grades.set_a = homework_a;
    grades.set_b = homework_b;

    // calculate and update the students final grade
    let midterm_grade = midterm * states::MIDTERM_WEIGHT;
    let final_grade = _final * states::FINAL_WEIGHT;
    let homework_grade = (homework_a + homework_b) * states::HOMEWORK_WEIGHT;

    student.final_grade = (midterm_grade + final_grade + homework_grade).round();

    Ok(())
}

#[derive(Accounts)]
pub struct SubmitGrades<'info> {

    #[account(mut)]
    pub submitter: Signer<'info>,

    #[account(
        init,
        payer = submitter,
        space = 8 + Grades::INIT_SPACE,
        seeds = [GRADE_SEED.as_bytes(), submitter.key().as_ref()],
        bump
    )]
    pub grades: Account<'info, Grades>,

    #[account(
        mut,
        seeds = [student.first_name.as_bytes(), STUDENT_SEED.as_bytes(),student.student_id.key().as_ref()],
        bump
    )]
    pub student: Account<'info, Student>,

    pub system_program: Program<'info, System>,
}