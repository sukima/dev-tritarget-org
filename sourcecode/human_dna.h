/* HUMAN_DNA.H
 *
 * Human Genome
 * Version 2.1
 *
 * (C) God
 */

/* Revision history:
 *
 * 0000-00-01 00:00  1.0  Adam.
 * 0000-00-02 10:00  1.1  Eve.
 * 0000-00-03 02:11  1.2  Added penis code to male version. A bit messy --
 *                        will require a rewrite later on to make it neater.
 * 0017-03-12 03:14  1.3  Added extra sex drive to male.h; took code from
 *                        elephant-dna.c
 * 0145-10-03 16:33  1.4  Removed tail.
 * 1115-00-31 17:20  1.5  Shortened forearms, expanded brain case.
 * 2091-08-20 13:56  1.6  Opposable thumbs added to hand() routine.
 * 2501-04-09 14:04  1.7  Minor cosmetic improvements -- skin colour made
 *                        darker to match my own image.
 * 2909-07-12 02:21  1.8  Dentition inadequate; added extra 'wisdom' teeth.
 *                        Must remember to make mouth bigger to compensate.
 * 4501-12-31 14:18  1.9  Increase average height.
 * 5533-02-12 17:09  2.0  Added gay option, triggered by high population
 *                        density, to try and slow the overpopulation problem.
 * 6004-11-04 16:11  2.1  Made forefinger narrower to fit hole in centre of
 *                        CD.
 */

/* Standard definitions
 */

#define SEX male
#define HEIGHT 1.84
#define MASS 68
#define RACE caucasian

/* Include inherited traits from parent DNA files.
 *
 * Files must be pre-processed with MENDEL program to provide proper
 * inheritance features.
 */

#include "mother.h"
#include "father.h"

#ifndef FATHER
#warn("Father unknown -- guessing\n")
#include "bastard.h"
#endif

/* Set up sex-specific functions and variables
 */
#include <sex.h>
 /* Kludged code -- I'll re-design this lot and re-write it as a proper
 * library sometime soon.
 */
struct genitals
   {
#ifdef MALE
   Penis *jt;
#endif
   /* G_spot *g;   Removed for debugging purposes */
#ifdef FEMALE
   Vagina *p;
#endif
   }

/* Initialization bootstrap routine -- called before DNA duplication.
 * Allocates buffers and sets up protein file pointers
 */
DNA *zygote_initialize(Sperm *, Ovum *);

/* MAIN INITIALIZATION CODE
 *
 * Returns structures containing pre-processed phenotypes for the organism
 * to display at birth.
 *
 * Will be improved later to make output less ugly.
 */
Characteristic *lookup_phenotype(Identifier *i);
