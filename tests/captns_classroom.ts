import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CaptnsClassroom } from "../target/types/captns_classroom";
import { PublicKey } from '@solana/web3.js';
import { assert } from "chai";

const STUDENT_SEED = "NEW_STUDENT"; 
const GRADE_SEED = "NEW_GRADES"

describe("captns_classroom", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const setCuLimit = anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({
  units: 1_000_000,
  });
  const program = anchor.workspace.CaptnsClassroom as Program<CaptnsClassroom>;

  // three students
  const alyssa = anchor.web3.Keypair.generate();
  const marnie = anchor.web3.Keypair.generate();
  const vee    = anchor.web3.Keypair.generate();

  // first names
  const alyssa_firstname = "Alyssa";
  const marnie_firstname = "Marnie";
  const vee_firstname    = "Vee";

  // name test cases
  const empty_name = "";
  const character_name = "🍅";
  const repeat_name = "Alyssa";

  // grades
  const alyssa_midterm1 = 187.5;
  const alyssa_final1   = 100.0;
  const alyssa_homeworka1 = 73.7;
  const alyssa_homeworkb1 = 4.2;

  const alyssa_midterm2 = 57.0;
  const alyssa_final2   = 144.0;
  const alyssa_homeworka2 = 82.5;
  const alyssa_homeworkb2 = 43.2;

  const alyssa_midterm3 = 56.0;
  const alyssa_final3   = 12.0;
  const alyssa_homeworka3 = 232.5;
  const alyssa_homeworkb3 = 76.2;

  const alyssa_midterm4 = 78.0;
  const alyssa_final4   = 92.0;
  const alyssa_homeworka4 = 82.5;
  const alyssa_homeworkb4 = 231.2;

  const alyssa_midterm5 = 88.0;
  const alyssa_final5   = 92.0;
  const alyssa_homeworka5 = 82.5;
  const alyssa_homeworkb5 = 43.2;

  const marnie_midterm1 = 3.5;
  const marnie_final1   = 78.0;
  const marnie_homeworka1 = 100.0;
  const marnie_homeworkb1 = 89.2;

  const vee_midterm   = 56.5;
  const vee_final     = 78.0;
  const vee_homeworka = 99.7;
  const vee_homeworkb = 89.2;

  async function ensureStudentExists(firstName: string, kp: anchor.web3.Keypair) {
    const [pda] = getStudentAcctAddress(firstName, kp.publicKey, program.programId);
    try {
      await program.account.student.fetch(pda);
    } catch {
      await airdrop(provider.connection, kp.publicKey);
      await program.methods
        .createStudent(firstName)
        .accounts({ studentIdentifier: kp.publicKey })
        .signers([kp])
        .rpc({ commitment: "confirmed" });
    }
    return pda;
  }

  describe("Create students", () => {

    it("Should not allow the same student to be created twice", async () => {
      let threw = false;
      try {
        await program.methods
          .createStudent(repeat_name) 
          .accounts({ studentIdentifier: alyssa.publicKey })
          .signers([alyssa])
          .rpc({ commitment: "confirmed" });
      } catch {
        threw = true;
      }
      assert.isTrue(threw, "Duplicate student creation should throw");
    });

    it("Should not allow a name past the maximum allowed characters", async () => {
      const longName = "X".repeat(40);
      const tmpStudent = anchor.web3.Keypair.generate();
      await airdrop(provider.connection, tmpStudent.publicKey);

      let threw = false;
      try {
        await program.methods
          .createStudent(longName)
          .accounts({ studentIdentifier: tmpStudent.publicKey })
          .signers([tmpStudent])
          .rpc({ commitment: "confirmed" });
      } catch {
        threw = true;
      }
      assert.isTrue(threw, "Should reject names longer than allowed");
    });

    it("Should not allow a name with any special characters", async () => {
      const tmpStudent = anchor.web3.Keypair.generate();
      await airdrop(provider.connection, tmpStudent.publicKey);

      let threw = false;
      try {
        await program.methods
          .createStudent(character_name)
          .accounts({ studentIdentifier: tmpStudent.publicKey })
          .signers([tmpStudent])
          .rpc({ commitment: "confirmed" });
      } catch {
        threw = true;
      }
      assert.isTrue(threw, "Should reject special character names");
    });

    it("Should not allow a student to create an account more than once", async () => {
      let threw = false;
      try {
        await program.methods
          .createStudent(alyssa_firstname)
          .accounts({ studentIdentifier: alyssa.publicKey })
          .signers([alyssa])
          .rpc({ commitment: "confirmed" });
      } catch {
        threw = true;
      }
      assert.isTrue(threw, "Same student wallet should not be able to create twice");
    });

    it("Should not allow a student to create an account with no characters", async () => {
      const tmpStudent = anchor.web3.Keypair.generate();
      await airdrop(provider.connection, tmpStudent.publicKey);

      let threw = false;
      try {
        await program.methods
          .createStudent(empty_name)
          .accounts({ studentIdentifier: tmpStudent.publicKey })
          .signers([tmpStudent])
          .rpc({ commitment: "confirmed" });
      } catch {
        threw = true;
      }
      assert.isTrue(threw, "Should reject empty names");
    });
  });

  describe("Delete students", () => {
    it("1) Should fail when removing non-existent student", async () => {
      const ghost = anchor.web3.Keypair.generate();
      await airdrop(provider.connection, ghost.publicKey);

      const ghost_name = "Ghost";
      let threw = false;
      try {
        await program.methods
          .deleteStudent(ghost_name)
          .accounts({ studentIdentifier: ghost.publicKey })
          .signers([ghost])
          .rpc({ commitment: "confirmed" });
      } catch {
        threw = true;
      }
      assert.isTrue(threw, "Deleting a non-existent student should fail");
    });
  });

describe("Submit grades", () => {

  it("Should fail if all grades are not submitted", async () => {
    const alyssaPda = await ensureStudentExists(alyssa_firstname, alyssa);

    let threw = false;
    try {
      await program.methods
        .submitGrades(
          alyssa_midterm1,
          null as any, // missing final
          alyssa_homeworka1,
          alyssa_homeworkb1
        )
        .accounts({ submitter: alyssa.publicKey })
        .preInstructions([setCuLimit])
        .signers([alyssa])
        .rpc({ commitment: "confirmed" });
    } catch { threw = true; }

    assert.isTrue(threw, "Submitting without all grade fields should fail");
    // Student should still exist
    await program.account.student.fetch(alyssaPda);
  });

  it("Should successfully create grades", async () => {
    const alyssaPda = await ensureStudentExists(alyssa_firstname, alyssa);

    await program.methods
      .submitGrades(alyssa_midterm1, alyssa_final1, alyssa_homeworka1, alyssa_homeworkb1)
      .accounts({ submitter: alyssa.publicKey })
      .preInstructions([setCuLimit])
      .signers([alyssa])
      .rpc({ commitment: "confirmed" });

    const s = await program.account.student.fetch(alyssaPda);
    assert.strictEqual(s.firstName, alyssa_firstname);
    assert.strictEqual(s.studentId.toString(), alyssa.publicKey.toString());
    assert.isAtLeast(Number(s.finalGrade), 5);
    assert.isAtMost(Number(s.finalGrade), 100);
  });

  it("Should allow re-submission only after deleting grades", async () => {
    await ensureStudentExists(alyssa_firstname, alyssa);

    await program.methods
      .submitGrades(alyssa_midterm2, alyssa_final2, alyssa_homeworka2, alyssa_homeworkb2)
      .accounts({ submitter: alyssa.publicKey })
      .preInstructions([setCuLimit])
      .signers([alyssa])
      .rpc({ commitment: "confirmed" });

    let threw = false;
    try {
      await program.methods
        .submitGrades(alyssa_midterm2, alyssa_final3, alyssa_homeworka2, alyssa_homeworkb2)
        .accounts({ submitter: alyssa.publicKey })
        .preInstructions([setCuLimit])
        .signers([alyssa])
        .rpc({ commitment: "confirmed" });
    } catch { threw = true; }
    assert.isTrue(threw, "Re-submission without deleting grades should fail");

    await program.methods
      .deleteGrades()
      .accounts({ submitter: alyssa.publicKey })
      .preInstructions([setCuLimit])
      .signers([alyssa])
      .rpc({ commitment: "confirmed" });

    await program.methods
      .submitGrades(alyssa_midterm2, alyssa_final3, alyssa_homeworka2, alyssa_homeworkb2)
      .accounts({ submitter: alyssa.publicKey })
      .preInstructions([setCuLimit])
      .signers([alyssa])
      .rpc({ commitment: "confirmed" });

    const [alyssaPda] = getStudentAcctAddress(alyssa_firstname, alyssa.publicKey, program.programId);
    const s1 = await program.account.student.fetch(alyssaPda);
    assert.isAtLeast(Number(s1.finalGrade), 5);
    assert.isAtMost(Number(s1.finalGrade), 100);
  });

  it("Should only allow the owner to re-submit grades", async () => {
    await ensureStudentExists(alyssa_firstname, alyssa);
    await airdrop(provider.connection, marnie.publicKey);

    await program.methods
      .submitGrades(alyssa_midterm3, alyssa_final3, alyssa_homeworka3, alyssa_homeworkb3)
      .accounts({ submitter: alyssa.publicKey })
      .preInstructions([setCuLimit])
      .signers([alyssa])
      .rpc({ commitment: "confirmed" });

    let threw = false;
    try {
      await program.methods
        .submitGrades(alyssa_midterm3, alyssa_final4, alyssa_homeworka3, alyssa_homeworkb3)
        .accounts({ submitter: alyssa.publicKey }) 
        .preInstructions([setCuLimit])
        .signers([marnie])                          
        .rpc({ commitment: "confirmed" });
    } catch { threw = true; }
    assert.isTrue(threw, "Only the owning student may submit/update their grades");
  });

  it("Should not allow a grade higher than 100", async () => {
    await ensureStudentExists(vee_firstname, vee);

    let threwCreate = false;
    try {
      await program.methods
        .submitGrades(vee_midterm, 101.0, vee_homeworka, vee_homeworkb)
        .accounts({ submitter: vee.publicKey })
        .preInstructions([setCuLimit])
        .signers([vee])
        .rpc({ commitment: "confirmed" });
    } catch { threwCreate = true; }
    assert.isTrue(threwCreate, "Final grade > 100 should be rejected");

    await program.methods
      .submitGrades(vee_midterm, vee_final, vee_homeworka, vee_homeworkb)
      .accounts({ submitter: vee.publicKey })
      .preInstructions([setCuLimit])
      .signers([vee])
      .rpc({ commitment: "confirmed" });

    await program.methods
      .deleteGrades()
      .accounts({ submitter: vee.publicKey })
      .preInstructions([setCuLimit])
      .signers([vee])
      .rpc({ commitment: "confirmed" });

    let threwUpdate = false;
    try {
      await program.methods
        .submitGrades(vee_midterm, 100.1, vee_homeworka, vee_homeworkb)
        .accounts({ submitter: vee.publicKey })
        .preInstructions([setCuLimit])
        .signers([vee])
        .rpc({ commitment: "confirmed" });
    } catch { threwUpdate = true; }
    assert.isTrue(threwUpdate, "Re-submitting with > 100 should be rejected");
  });

  it("Should not allow a grade lower than 5", async () => {
    await ensureStudentExists(marnie_firstname, marnie);

    let threwCreate = false;
    try {
      await program.methods
        .submitGrades(marnie_midterm1, 4.9, marnie_homeworka1, marnie_homeworkb1)
        .accounts({ submitter: marnie.publicKey })
        .preInstructions([setCuLimit])
        .signers([marnie])
        .rpc({ commitment: "confirmed" });
    } catch { threwCreate = true; }
    assert.isTrue(threwCreate, "Final grade < 5 should be rejected");

    await program.methods
      .submitGrades(marnie_midterm1, marnie_final1, marnie_homeworka1, marnie_homeworkb1)
      .accounts({ submitter: marnie.publicKey })
      .preInstructions([setCuLimit])
      .signers([marnie])
      .rpc({ commitment: "confirmed" });

    await program.methods
      .deleteGrades()
      .accounts({ submitter: marnie.publicKey })
      .preInstructions([setCuLimit])
      .signers([marnie])
      .rpc({ commitment: "confirmed" });

    let threwUpdate = false;
    try {
      await program.methods
        .submitGrades(marnie_midterm1, 0.0, marnie_homeworka1, marnie_homeworkb1)
        .accounts({ submitter: marnie.publicKey })
        .preInstructions([setCuLimit])
        .signers([marnie])
        .rpc({ commitment: "confirmed" });
    } catch { threwUpdate = true; }
    assert.isTrue(threwUpdate, "Re-submitting with < 5 should be rejected");
  });

  it("Should require delete before re-submission", async () => {
    const alyssaPda = await ensureStudentExists(alyssa_firstname, alyssa);

    // First submission
    await program.methods
      .submitGrades(alyssa_midterm5, alyssa_final5, alyssa_homeworka5, alyssa_homeworkb5)
      .accounts({ submitter: alyssa.publicKey })
      .preInstructions([setCuLimit])
      .signers([alyssa])
      .rpc({ commitment: "confirmed" });

    // Second submission without delete should fail
    let threw = false;
    try {
      await program.methods
        .submitGrades(alyssa_midterm4, alyssa_final4, alyssa_homeworka4, alyssa_homeworkb4)
        .accounts({ submitter: alyssa.publicKey })
        .preInstructions([setCuLimit])
        .signers([alyssa])
        .rpc({ commitment: "confirmed" });
    } catch { threw = true; }
    assert.isTrue(threw, "Re-submission without deleting grades should fail");

    // Delete + re-submit works
    await program.methods
      .deleteGrades()
      .accounts({ submitter: alyssa.publicKey })
      .preInstructions([setCuLimit])
      .signers([alyssa])
      .rpc({ commitment: "confirmed" });

    await program.methods
      .submitGrades(alyssa_midterm4, alyssa_final4, alyssa_homeworka4, alyssa_homeworkb4)
      .accounts({ submitter: alyssa.publicKey })
      .preInstructions([setCuLimit])
      .signers([alyssa])
      .rpc({ commitment: "confirmed" });

    const s = await program.account.student.fetch(alyssaPda);
    assert.isAtLeast(Number(s.finalGrade), 5);
    assert.isAtMost(Number(s.finalGrade), 100);
  });
});

  describe("Delete grades", () => {
    it("Should close the grades account", async () => {
      await ensureStudentExists(alyssa_firstname, alyssa);

      await program.methods
        .submitGrades(alyssa_midterm1, alyssa_final1, alyssa_homeworka1, alyssa_homeworkb1)
        .accounts({ submitter: alyssa.publicKey })
        .preInstructions([setCuLimit])  
        .signers([alyssa])
        .rpc({ commitment: "confirmed" });

      const [gradesPda] = getGradeAcctAddress(alyssa.publicKey, program.programId);

      await program.account.grades.fetch(gradesPda);

      await program.methods
        .deleteGrades()
        .accounts({ submitter: alyssa.publicKey })
        .signers([alyssa])
        .rpc({ commitment: "confirmed" });

      let fetchThrew = false;
      try { await program.account.grades.fetch(gradesPda); } catch { fetchThrew = true; }
      const info = await provider.connection.getAccountInfo(gradesPda);

      assert.isTrue(fetchThrew, "Fetching a closed grades account should throw");
      assert.isNull(info, "Closed grades account should be fully deallocated (null)");
    });
  });
});

async function airdrop(connection: any, address: any, amount = 1_000_000_000) {
  await connection.confirmTransaction(
    await connection.requestAirdrop(address, amount),
    "confirmed"
  );
}

function getStudentAcctAddress(first_name: string, student: PublicKey, programID: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode(first_name),
      anchor.utils.bytes.utf8.encode(STUDENT_SEED),
      student.toBuffer(),
    ],
    programID
  );
}

function getGradeAcctAddress(grader: PublicKey, programID: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode(GRADE_SEED),
      grader.toBuffer(),
    ],
    programID
  );
}
