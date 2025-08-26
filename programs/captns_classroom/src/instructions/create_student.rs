use anchor_lang::prelude::*;

use crate::{instruction};
use crate::states::{self, *};
use crate::events::{self, *};
use crate::errors::ClassError;

pub fn create_student(
    ctx: Context<CreateStudent>, first_name: String,
 ) -> Result<()> {

    let student = &mut ctx.accounts.student;

    // check name length
    if first_name.len() > states::NAME_LENGTH {
        return Err(ClassError::NameLengthExceeded.into());
    }

    student.student_id = ctx.accounts.student_identifier.key();
    student.first_name = first_name;
    student.final_grade = 0.0;
    student.bump = ctx.bumps.student.into(); 

    emit!(StudentEvent {
        student_id: ctx.accounts.student_identifier.key(),
        first_name: student.first_name.clone(),
    });

    Ok(())
}

#[derive(Accounts)]
#[instruction(first_name: String)]
pub struct CreateStudent<'info> {
    
    #[account(mut)]
    pub student_identifier: Signer<'info>,

    #[account(
        init,
        payer = student_identifier,
        space = 8 + Student::INIT_SPACE,
        seeds = [first_name.as_bytes(), STUDENT_SEED.as_bytes(),student_identifier.key().as_ref()],
        bump
    )]
    pub student: Account<'info, Student>,

    pub system_program: Program<'info, System>,
}
